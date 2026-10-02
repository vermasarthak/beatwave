# Spotify Integration & Source Capability Enforcement

## Principle: Opaque Transport Source

In Beatwave, Spotify is treated strictly as an opaque playback transport, **never** an audio buffer source.

```
Local File / Procedural Source:
  transport     = true
  decodedAudio  = true
  slicing       = true
  localAnalysis = true
  effects       = true
  recording     = true
  exportAudio   = true

Spotify Source:
  transport     = true
  decodedAudio  = false (PROHIBITED)
  slicing       = false (PROHIBITED)
  localAnalysis = false (PROHIBITED)
  effects       = false (PROHIBITED)
  recording     = false (PROHIBITED)
  exportAudio   = false (PROHIBITED)
```

## Security & Compliance Rules
1. **OAuth 2.0 PKCE**: Uses Authorization Code with Proof Key for Code Exchange (RFC 7636). Zero client secrets in frontend code.
2. **Domain-Layer Enforcement**: Attempting to pass a Spotify track to slicing, stem separation, recording, or audio graph raises `IncompatibleSourceCapabilityError`.
3. **No PCM Access**: Raw audio stream is never intercepted, decoded, recorded, or modified.
4. **Spotify Developer Mode Limitations**: Developers must register their own Spotify Client ID in Spotify's developer portal and add their account under the Users Management tab while their application is in Development Mode.
