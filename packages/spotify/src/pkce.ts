/**
 * PKCE (Proof Key for Code Exchange) Utilities for Spotify OAuth 2.0.
 * Complies with RFC 7636.
 */

export async function generateCodeVerifier(length: number = 64): Promise<string> {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);

  // Base64-URL encode
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return base64;
}

export function buildSpotifyAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  scopes: string[] = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming'
  ]
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: scopes.join(' ')
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
