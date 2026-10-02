# Beatwave Security Policy

## Threat Model & Mitigations

### 1. Camera Stream Exfiltration
- **Threat**: Malicious code or compromised dependency attempts to capture webcam pixels.
- **Mitigation**: Strict Content Security Policy (`script-src 'self'`), zero external third-party script tags, camera processing isolated inside typed `packages/vision`.

### 2. Malicious Audio File Upload (Audio Lab)
- **Threat**: Upload of polyglot or malformed files attempting arbitrary code execution or path traversal.
- **Mitigation**:
  - Uploaded files are assigned random UUID hex names.
  - Path traversal defense asserts `os.path.abspath(filepath).startswith(temp_dir)`.
  - File size hard limit enforced at 50MB.
  - Automatic unlinking of temporary files upon request completion.

### 3. OAuth Token Exposure (Spotify)
- **Threat**: Token leakage via URL parameters or compromised storage.
- **Mitigation**:
  - Strict PKCE (Proof Key for Code Exchange) flow; no client secret is bundled or accepted in client code.
  - Tokens held in transient memory or cleared upon Disconnect.

### 4. Malformed Project Import
- **Threat**: Malicious JSON payload crafted to trigger prototype pollution or application crashes.
- **Mitigation**: Strict runtime validation of project sessions with Zod schemas (`BeatwaveSessionSchema`).
