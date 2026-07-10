// SPDX-License-Identifier: MIT
import Foundation
import CoreGraphics
import AppKit
import ScreenCaptureKit

// Reads "x y" or "x y excludePid" lines from stdin, outputs JSON for the window at that point

// All shared state goes through cacheLock — the read loop, the startup
// warm-up Task, and any in-flight detection Tasks all touch these caches
// concurrently.
let cacheLock = NSLock()
var iconCache: [Int: String] = [:]
var radiusCache: [Int: Double] = [:]
var radiusInFlight: Set<Int> = []

func cachedIcon(_ pid: Int) -> String? {
  cacheLock.lock(); defer { cacheLock.unlock() }
  return iconCache[pid]
}

func setCachedIcon(_ pid: Int, _ value: String) {
  cacheLock.lock(); iconCache[pid] = value; cacheLock.unlock()
}

func cachedRadius(_ id: Int) -> Double? {
  cacheLock.lock(); defer { cacheLock.unlock() }
  return radiusCache[id]
}

func setCachedRadius(_ id: Int, _ value: Double) {
  cacheLock.lock(); radiusCache[id] = value; cacheLock.unlock()
}

// Atomic claim — first caller for this windowId gets `true` and is
// responsible for running detection; subsequent callers get `false` and
// skip, so concurrent hover/warmup paths don't fan out duplicate SCK
// round-trips for the same window.
func tryClaimDetection(_ id: Int) -> Bool {
  cacheLock.lock(); defer { cacheLock.unlock() }
  return radiusInFlight.insert(id).inserted
}

func releaseDetection(_ id: Int) {
  cacheLock.lock(); radiusInFlight.remove(id); cacheLock.unlock()
}

func getIconBase64(pid: Int) -> String {
  if let cached = cachedIcon(pid) { return cached }
  var base64 = ""
  if let runningApp = NSRunningApplication(processIdentifier: pid_t(pid)),
     let icon = runningApp.icon {
    icon.size = NSSize(width: 128, height: 128)
    if let tiff = icon.tiffRepresentation,
       let rep = NSBitmapImageRep(data: tiff),
       let png = rep.representation(using: .png, properties: [:]) {
      base64 = png.base64EncodedString()
    }
  }
  setCachedIcon(pid, base64)
  return base64
}

// Sample the window's top-left alpha to find its actual corner radius (in
// points). Uses SCScreenshotManager — the only public-API path that yields
// a transparent corner mask now that CGWindowListCreateImage is obsoleted
// in macOS 15+.
//
// Note: a one-shot SCScreenshotManager call doesn't establish a streaming
// session, so it doesn't engage the macOS Sonoma 14.4+ per-window privacy
// badge that an SCStream with a window filter would.
@available(macOS 14.0, *)
func measureCornerRadius(windowId: Int, frame: CGRect) async -> Double {
  let fallback: Double = 10
  do {
    let content = try await SCShareableContent.excludingDesktopWindows(
      false, onScreenWindowsOnly: true)
    guard let window = content.windows.first(where: { $0.windowID == UInt32(windowId) }) else {
      return fallback
    }
    let filter = SCContentFilter(desktopIndependentWindow: window)
    let config = SCStreamConfiguration()
    let scale = Int(NSScreen.main?.backingScaleFactor ?? 2)
    config.width = max(1, Int(window.frame.width)) * scale
    config.height = max(1, Int(window.frame.height)) * scale
    config.showsCursor = false
    config.captureResolution = .best
    let cgImage = try await SCScreenshotManager.captureImage(
      contentFilter: filter, configuration: config)
    return computeRadius(from: cgImage, frame: frame) ?? fallback
  } catch {
    return fallback
  }
}

func computeRadius(from cgImage: CGImage, frame: CGRect) -> Double? {
  let width = cgImage.width
  let height = cgImage.height
  guard width > 0, height > 0, frame.height > 0 else { return nil }

  let pointsPerPixel = Double(frame.height) / Double(height)
  let scanLimit = min(80, min(width, height))
  let bytesPerPixel = 4
  let bytesPerRow = width * bytesPerPixel
  let colorSpace = CGColorSpaceCreateDeviceRGB()

  guard let context = CGContext(
    data: nil,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: bytesPerRow,
    space: colorSpace,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  ) else { return nil }

  context.clear(CGRect(x: 0, y: 0, width: width, height: height))
  context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
  guard let buffer = context.data else { return nil }
  let pixels = buffer.bindMemory(to: UInt8.self, capacity: bytesPerRow * height)

  // CGContext memory is bottom-up: y=height-1 is the top row.
  var sawTransparent = false
  var detectedPixels = 0
  for d in 0..<scanLimit {
    let topRow = height - 1 - d
    let alphaOffset = topRow * bytesPerRow + 3
    let alpha = pixels[alphaOffset]
    if alpha < 32 {
      sawTransparent = true
      continue
    }
    if sawTransparent {
      detectedPixels = d
      break
    } else {
      // Top-left pixel is already opaque — non-rounded window.
      return 0
    }
  }

  if detectedPixels > 0 && detectedPixels < scanLimit {
    return Double(detectedPixels) * pointsPerPixel
  }
  return nil
}

// Hover-path lookup: return immediately with cached value or fallback,
// kicking off a background detection so the cache is filled for the next
// hover. The previous implementation blocked the read loop for up to
// 800ms on a synchronous SCK round-trip — that's what made the first
// hover after launch feel sluggish, since SCK pays a heavy lazy-init cost
// on its first call within the process.
@available(macOS 14.0, *)
func cornerRadiusForHover(windowId: Int, frame: CGRect) -> Double {
  if let cached = cachedRadius(windowId) { return cached }
  let fallback: Double = 10
  if tryClaimDetection(windowId) {
    Task.detached {
      let radius = await measureCornerRadius(windowId: windowId, frame: frame)
      setCachedRadius(windowId, radius)
      releaseDetection(windowId)
    }
  }
  return fallback
}

// At process startup, snapshot all on-screen windows and warm both caches in
// parallel: pre-fetch app icons (cheap, no SCK) and pre-detect corner radii
// (one SCK round-trip per window, run concurrently). By the time the user
// moves their cursor over a window, its entry is usually already a cache
// hit — no SCK round-trip on the read-loop critical path.
@available(macOS 14.0, *)
func warmupCaches() {
  Task.detached {
    let info = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID)
      as! [[String: Any]]

    // Icon prefetch: synchronous but fast (~5-30ms per app), and dedup'd
    // by pid so we don't re-render the same icon for every window an app
    // owns.
    var seenPids = Set<Int>()
    for w in info {
      guard let layer = w["kCGWindowLayer"] as? Int, layer == 0 else { continue }
      guard let pid = w["kCGWindowOwnerPID"] as? Int, pid > 0 else { continue }
      if seenPids.insert(pid).inserted {
        _ = getIconBase64(pid: pid)
      }
    }

    // Corner-radius prefetch: parallelize so total warm-up time is
    // bounded by the slowest single window, not the sum. Each capture is
    // a one-shot SCScreenshotManager call, which does not engage the
    // per-window privacy badge.
    do {
      let content = try await SCShareableContent.excludingDesktopWindows(
        false, onScreenWindowsOnly: true)
      await withTaskGroup(of: Void.self) { group in
        for win in content.windows where win.windowLayer == 0 {
          let id = Int(win.windowID)
          if cachedRadius(id) != nil { continue }
          guard tryClaimDetection(id) else { continue }
          let frame = win.frame
          group.addTask {
            let radius = await measureCornerRadius(windowId: id, frame: frame)
            setCachedRadius(id, radius)
            releaseDetection(id)
          }
        }
      }
    } catch {
      // Warm-up failure is non-fatal — uncached hovers still return the
      // fallback immediately and detection runs in the background.
    }
  }
}

if #available(macOS 14.0, *) {
  warmupCaches()
}

while let line = readLine() {
  let parts = line.trimmingCharacters(in: .whitespaces).split(separator: " ")

  // "focus <pid>" — raise the target app so the captured window gains
  // focus when the recording toolbar hides. Without this, macOS falls
  // back to whichever app was previously frontmost (and the dock can
  // auto-show because no app holds the frontmost slot).
  if parts.count >= 2, parts[0] == "focus", let pid = Int(parts[1]) {
    let runningApp = NSRunningApplication(processIdentifier: pid_t(pid))
    // `.activateIgnoringOtherApps` is deprecated in macOS 14+; the no-arg
    // `activate()` on NSRunningApplication is what AppKit recommends now.
    let ok = runningApp?.activate() ?? false
    fputs((ok ? "ok" : "fail") + "\n", stdout)
    fflush(stdout)
    continue
  }

  // "focus-topmost <excludePid>" — raise the owner of the topmost
  // on-screen window that isn't CaptureFlow. Used for display/area
  // recordings where there's no specific target pid: without this
  // the toolbar hide drops the app out of frontmost and macOS shows
  // the dock since nothing holds the slot.
  if parts.count >= 1, parts[0] == "focus-topmost" {
    let excludePid: Int? = parts.count >= 2 ? Int(parts[1]) : nil
    let info = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as! [[String: Any]]
    var picked: Int? = nil
    for w in info {
      guard let layer = w["kCGWindowLayer"] as? Int, layer == 0 else { continue }
      let pid = w["kCGWindowOwnerPID"] as? Int ?? 0
      if pid == 0 { continue }
      if let ep = excludePid, pid == ep { continue }
      picked = pid
      break
    }
    var ok = false
    if let pid = picked {
      ok = NSRunningApplication(processIdentifier: pid_t(pid))?.activate() ?? false
    }
    fputs((ok ? "ok" : "fail") + "\n", stdout)
    fflush(stdout)
    continue
  }

  guard parts.count >= 2,
        let px = Double(parts[0]),
        let py = Double(parts[1]) else {
    fputs("null\n", stdout)
    fflush(stdout)
    continue
  }
  let excludePid: Int? = parts.count >= 3 ? Int(parts[2]) : nil

  let info = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as! [[String: Any]]
  var found = false

  for w in info {
    guard let layer = w["kCGWindowLayer"] as? Int, layer == 0 else { continue }
    guard let owner = w["kCGWindowOwnerName"] as? String else { continue }
    let pid = w["kCGWindowOwnerPID"] as? Int ?? 0
    if let ep = excludePid, pid == ep { continue }

    let b = w["kCGWindowBounds"] as? [String: CGFloat] ?? [:]
    let bx = b["X"] ?? 0, by = b["Y"] ?? 0, bw = b["Width"] ?? 0, bh = b["Height"] ?? 0

    if CGFloat(px) >= bx && CGFloat(px) < bx + bw && CGFloat(py) >= by && CGFloat(py) < by + bh {
      let name = w["kCGWindowName"] as? String ?? ""
      let id = w["kCGWindowNumber"] as? Int ?? 0
      let iconBase64 = getIconBase64(pid: pid)
      let frame = CGRect(x: bx, y: by, width: bw, height: bh)
      let cornerRadius: Double
      if #available(macOS 14.0, *) {
        cornerRadius = cornerRadiusForHover(windowId: id, frame: frame)
      } else {
        cornerRadius = 10
      }
      var result: [String: Any] = [
        "id": id,
        "name": name,
        "owner": owner,
        "pid": pid,
        "bounds": ["x": bx, "y": by, "width": bw, "height": bh],
        "cornerRadius": cornerRadius
      ]
      if !iconBase64.isEmpty {
        result["iconBase64"] = iconBase64
      }
      let data = try! JSONSerialization.data(withJSONObject: result)
      fputs(String(data: data, encoding: .utf8)! + "\n", stdout)
      fflush(stdout)
      found = true
      break
    }
  }

  if !found {
    fputs("null\n", stdout)
    fflush(stdout)
  }
}
