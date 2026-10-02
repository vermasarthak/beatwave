# Beatwave Privacy Guarantee

## Core Principle
**Camera pixels never leave your machine.**

## Technical Guarantees
1. **Local Vision Inference**: Video frames from `<video>` elements are processed in-process via MediaPipe WebAssembly / WebGPU. No network socket is established for video data.
2. **Zero Third-Party Telemetry**: Beatwave contains zero tracking cookies, third-party analytics scripts (no Google Analytics, no Mixpanel, no Facebook Pixel).
3. **Local Audio Storage**: Imported audio samples and project sessions are persisted exclusively in client-side IndexedDB and browser storage.
4. **Local Audio-Lab Service**: The optional Python audio lab binds exclusively to `127.0.0.1:8765`. It processes files from localhost only and automatically cleans up temporary files immediately after processing.
