"""Minimal CDP driver: navigate, evaluate, and screenshot clipped regions.

Headless Chrome needs --remote-allow-origins=* or the websocket handshake is
rejected, and the client must send an empty Origin for the same reason.
"""
import base64
import json
import subprocess
import time
import urllib.request

import websocket

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


class Browser:
    def __init__(self, port=9444, width=1440, height=1000, scale=2):
        self.port = port
        self.proc = subprocess.Popen(
            [CHROME, "--headless=new", f"--remote-debugging-port={port}",
             f"--user-data-dir=/tmp/cf-cdp-{port}", "--remote-allow-origins=*",
             "--no-first-run", "--hide-scrollbars", "--force-device-scale-factor=1",
             "--no-default-browser-check", "--disable-gpu",
             f"--window-size={width},{height}"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(40):
            try:
                tgt = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json"))
                tgt = [t for t in tgt if t["type"] == "page"][0]
                break
            except Exception:
                time.sleep(0.5)
        else:
            raise RuntimeError("chrome did not start")
        self.ws = websocket.create_connection(tgt["webSocketDebuggerUrl"], origin="")
        self.ws.settimeout(60)
        self._id = 0
        self.cmd("Page.enable")
        self.cmd("Runtime.enable")
        self.cmd("Emulation.setDeviceMetricsOverride",
                 {"width": width, "height": height, "deviceScaleFactor": scale,
                  "mobile": False})
        # Headless defaults to reduce, which freezes any entrance animation
        # mid-way and leaves sections half-faded.
        self.cmd("Emulation.setEmulatedMedia",
                 {"features": [{"name": "prefers-reduced-motion",
                                "value": "no-preference"}]})

    def cmd(self, method, params=None):
        self._id += 1
        self.ws.send(json.dumps({"id": self._id, "method": method,
                                 "params": params or {}}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self._id:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    def goto(self, url, settle=3.0):
        self.cmd("Page.navigate", {"url": url})
        time.sleep(settle)

    def js(self, expr):
        r = self.cmd("Runtime.evaluate",
                     {"expression": expr, "returnByValue": True,
                      "awaitPromise": True})
        return r.get("result", {}).get("value")

    def shot(self, path, clip=None, scale=2):
        params = {"format": "png", "captureBeyondViewport": True}
        if clip:
            params["clip"] = {**clip, "scale": scale}
        data = self.cmd("Page.captureScreenshot", params)["data"]
        with open(path, "wb") as f:
            f.write(base64.b64decode(data))
        return path

    def close(self):
        try:
            self.ws.close()
        finally:
            self.proc.terminate()
