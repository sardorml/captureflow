import Cocoa

// Monitors the active system cursor type by polling NSCursor.currentSystem
// and matching against known macOS cursor fingerprints (size + hotspot).
//
// Requires NSApplication with accessory activation policy to join the
// window server session.
//
// Output: STATE:<cursor-type> on each change (to stdout)
// Types: arrow, text, pointer, crosshair, open-hand, closed-hand, resize-ew, resize-ns

setbuf(stdout, nil)

let nsApp = NSApplication.shared
nsApp.setActivationPolicy(.accessory)
nsApp.finishLaunching()

// ── Fingerprints ──

struct CursorFP {
    let name: String
    let w: CGFloat
    let h: CGFloat
    let hotX: CGFloat
    let hotY: CGFloat
    let imageHash: Int
}

func hashImage(_ image: NSImage) -> Int {
    guard let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { return 0 }
    let bytes = [UInt8](png)
    var h = 5381
    for b in bytes { h = ((h << 5) &+ h) &+ Int(b) }
    return h
}

let refs: [CursorFP] = [
    ("arrow", NSCursor.arrow),
    ("text", .iBeam),
    ("pointer", .pointingHand),
    ("crosshair", .crosshair),
    ("open-hand", .openHand),
    ("closed-hand", .closedHand),
    ("resize-ew", .resizeLeftRight),
    ("resize-ns", .resizeUpDown),
].compactMap { (name, cursor) in
    let s = cursor.image.size
    guard s.width > 0 && s.height > 0 else { return nil }
    return CursorFP(
        name: name, w: s.width, h: s.height,
        hotX: cursor.hotSpot.x, hotY: cursor.hotSpot.y,
        imageHash: hashImage(cursor.image)
    )
}

// ── Classification ──

func classify(_ cursor: NSCursor) -> String {
    let s = cursor.image.size
    let hot = cursor.hotSpot
    guard s.width > 0 && s.height > 0 else { return "arrow" }

    // Match by size + hotspot
    var candidates: [CursorFP] = []
    for fp in refs {
        if abs(s.width - fp.w) < 1
            && abs(s.height - fp.h) < 1
            && abs(hot.x - fp.hotX) < 1
            && abs(hot.y - fp.hotY) < 1
        {
            candidates.append(fp)
        }
    }

    if candidates.count == 1 { return candidates[0].name }

    // Disambiguate same-size cursors (e.g. open-hand vs closed-hand) via image hash
    if candidates.count > 1 {
        let h = hashImage(cursor.image)
        for fp in candidates {
            if fp.imageHash == h { return fp.name }
        }
        return candidates[0].name
    }

    // No size match — try hash only
    let h = hashImage(cursor.image)
    for fp in refs {
        if fp.imageHash != 0 && fp.imageHash == h { return fp.name }
    }

    return "arrow"
}

// ── Poll loop ──

var lastType = ""
print("STATE:arrow")

let timer = Timer(timeInterval: 0.05, repeats: true) { _ in
    guard let cursor = NSCursor.currentSystem else { return }
    let current = classify(cursor)
    if current != lastType {
        lastType = current
        print("STATE:\(current)")
    }
}

RunLoop.main.add(timer, forMode: .default)
RunLoop.main.run()
