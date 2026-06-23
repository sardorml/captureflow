// Electron only exposes `roundedCorners: boolean` with the system default
// radius; we call into libobjc with koffi to override it.

import type { BrowserWindow } from 'electron'

let applied = false
let setCornerRadiusImpl: ((view: Buffer, radius: number) => void) | null = null

function getImpl(): ((view: Buffer, radius: number) => void) | null {
  if (setCornerRadiusImpl) return setCornerRadiusImpl
  if (applied) return null
  applied = true

  if (process.platform !== 'darwin') return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let koffi: any
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    koffi = require('koffi')
  } catch (err) {
    console.warn('[corner-radius] koffi unavailable:', err)
    return null
  }

  try {
    const objc = koffi.load('/usr/lib/libobjc.A.dylib')

    const sel_registerName = objc.func('void* sel_registerName(const char* name)')
    const msgSend_layer = objc.func('void* objc_msgSend(void* self, void* sel)')
    const msgSend_setBool = objc.func('void objc_msgSend(void* self, void* sel, bool arg)')
    const msgSend_setDouble = objc.func('void objc_msgSend(void* self, void* sel, double arg)')

    const selLayer = sel_registerName('layer')
    const selSetWantsLayer = sel_registerName('setWantsLayer:')
    const selSetMasksToBounds = sel_registerName('setMasksToBounds:')
    const selSetCornerRadius = sel_registerName('setCornerRadius:')

    setCornerRadiusImpl = (viewHandleBuffer: Buffer, radius: number): void => {
      // getNativeWindowHandle() returns a Buffer holding the NSView* pointer bytes.
      const viewPtr = koffi.decode(viewHandleBuffer, 'void*')
      if (!viewPtr) return
      msgSend_setBool(viewPtr, selSetWantsLayer, true)
      const layerPtr = msgSend_layer(viewPtr, selLayer)
      if (!layerPtr) return
      msgSend_setBool(layerPtr, selSetMasksToBounds, true)
      msgSend_setDouble(layerPtr, selSetCornerRadius, radius)
    }
    return setCornerRadiusImpl
  } catch (err) {
    console.warn('[corner-radius] failed to init:', err)
    return null
  }
}

export function applyCustomCornerRadius(win: BrowserWindow, radius: number): void {
  const impl = getImpl()
  if (!impl) return
  try {
    const handle = win.getNativeWindowHandle()
    impl(handle, radius)
  } catch (err) {
    console.warn('[corner-radius] apply failed:', err)
  }
}
