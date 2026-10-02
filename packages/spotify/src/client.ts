import {
  assertSourceCapability,
  IncompatibleSourceCapabilityError
} from '@beatwave/protocol';

export interface SpotifyTrackMeta {
  readonly id: string;
  readonly name: string;
  readonly artists: string[];
  readonly albumName: string;
  readonly albumArtUrl?: string;
  readonly durationMs: number;
}

export interface SpotifyPlaybackState {
  readonly isPlaying: boolean;
  readonly progressMs: number;
  readonly currentTrack: SpotifyTrackMeta | null;
  readonly deviceName: string;
  readonly volumePercent: number;
}

export class SpotifyTransportClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly clientId: string) {}

  public setAccessToken(token: string, expiresInSec: number): void {
    this.accessToken = token;
    this.tokenExpiresAt = Date.now() + expiresInSec * 1000;
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiresAt;
  }

  public disconnect(): void {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Transport command: Play / Resume
   */
  public async play(): Promise<void> {
    assertSourceCapability('spotify', 'transport', 'play');
    await this.callSpotifyApi('PUT', '/v1/me/player/play');
  }

  /**
   * Transport command: Pause
   */
  public async pause(): Promise<void> {
    assertSourceCapability('spotify', 'transport', 'pause');
    await this.callSpotifyApi('PUT', '/v1/me/player/pause');
  }

  /**
   * Transport command: Next track
   */
  public async next(): Promise<void> {
    assertSourceCapability('spotify', 'transport', 'next');
    await this.callSpotifyApi('POST', '/v1/me/player/next');
  }

  /**
   * Transport command: Previous track
   */
  public async previous(): Promise<void> {
    assertSourceCapability('spotify', 'transport', 'previous');
    await this.callSpotifyApi('POST', '/v1/me/player/previous');
  }

  /**
   * Transport command: Set volume
   */
  public async setVolume(volumePercent: number): Promise<void> {
    assertSourceCapability('spotify', 'transport', 'volume');
    const vol = Math.max(0, Math.min(100, Math.round(volumePercent)));
    await this.callSpotifyApi('PUT', `/v1/me/player/volume?volume_percent=${vol}`);
  }

  /**
   * Explicitly disallow any raw audio retrieval or slicing
   */
  public getRawAudioBuffer(): never {
    throw new IncompatibleSourceCapabilityError(
      'spotify',
      'decodedAudio',
      'getRawAudioBuffer'
    );
  }

  public sliceAudio(): never {
    throw new IncompatibleSourceCapabilityError(
      'spotify',
      'slicing',
      'sliceAudio'
    );
  }

  public separateStems(): never {
    throw new IncompatibleSourceCapabilityError(
      'spotify',
      'localAnalysis',
      'separateStems'
    );
  }

  private async callSpotifyApi(method: string, path: string, body?: any): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('[SpotifyTransportClient] Not authenticated with Spotify.');
    }

    const res = await fetch(`https://api.spotify.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 204) return null;
    if (!res.ok) {
      throw new Error(`Spotify API error ${res.status}: ${res.statusText}`);
    }
    return res.json().catch(() => null);
  }
}
