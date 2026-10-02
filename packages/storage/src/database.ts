import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  CalibrationProfile,
  BeatwaveSession,
  BeatwaveSessionSchema,
  DEFAULT_CALIBRATION_PROFILE
} from '@beatwave/protocol';

interface BeatwaveDB extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
  projects: {
    key: string;
    value: BeatwaveSession;
  };
  calibration: {
    key: string;
    value: CalibrationProfile;
  };
}

const DB_NAME = 'beatwave_local_db';
const DB_VERSION = 1;

export class LocalStorageManager {
  private dbPromise: Promise<IDBPDatabase<BeatwaveDB>> | null = null;

  private async getDB(): Promise<IDBPDatabase<BeatwaveDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<BeatwaveDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
          if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects');
          }
          if (!db.objectStoreNames.contains('calibration')) {
            db.createObjectStore('calibration');
          }
        }
      });
    }
    return this.dbPromise;
  }

  public async saveCalibration(profile: CalibrationProfile): Promise<void> {
    const db = await this.getDB();
    await db.put('calibration', profile, 'active_profile');
  }

  public async loadCalibration(): Promise<CalibrationProfile> {
    try {
      const db = await this.getDB();
      const profile = await db.get('calibration', 'active_profile');
      return profile || { ...DEFAULT_CALIBRATION_PROFILE };
    } catch {
      return { ...DEFAULT_CALIBRATION_PROFILE };
    }
  }

  public async saveProject(session: BeatwaveSession): Promise<void> {
    // Validate schema before persisting
    const parsed = BeatwaveSessionSchema.parse(session);
    const db = await this.getDB();
    await db.put('projects', parsed, parsed.projectId);
  }

  public async loadProject(projectId: string): Promise<BeatwaveSession | undefined> {
    const db = await this.getDB();
    const session = await db.get('projects', projectId);
    return session;
  }

  public async listProjects(): Promise<BeatwaveSession[]> {
    const db = await this.getDB();
    return db.getAll('projects');
  }

  public exportProjectJson(session: BeatwaveSession): string {
    const parsed = BeatwaveSessionSchema.parse(session);
    return JSON.stringify(parsed, null, 2);
  }

  public importProjectJson(jsonStr: string): BeatwaveSession {
    const raw = JSON.parse(jsonStr);
    return BeatwaveSessionSchema.parse(raw);
  }

  public async resetAllLocalData(): Promise<void> {
    const db = await this.getDB();
    await db.clear('settings');
    await db.clear('projects');
    await db.clear('calibration');
  }
}
