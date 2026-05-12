import { Injectable, signal } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export interface AutoSaveData {
  timestamp: number;
  data: unknown;
  key: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutoSaveService {
  private readonly STORAGE_PREFIX = 'autosave_';
  private readonly AUTO_SAVE_INTERVAL = 10000; // 10 seconds
  private readonly destroy$ = new Subject<void>();
  private readonly dataChange$ = new Subject<{ key: string; data: unknown }>();

  readonly hasUnsavedData = signal(false);

  constructor() {
    // Auto-save on data change with debounce
    this.dataChange$
      .pipe(
        debounceTime(this.AUTO_SAVE_INTERVAL),
        takeUntil(this.destroy$)
      )
      .subscribe(({ key, data }) => {
        this.saveToStorage(key, data);
      });
  }

  /**
   * Register data for auto-save
   */
  registerAutoSave(key: string, data: unknown): void {
    this.dataChange$.next({ key, data });
    this.hasUnsavedData.set(true);
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(key: string, data: unknown): void {
    try {
      const autoSaveData: AutoSaveData = {
        timestamp: Date.now(),
        data,
        key
      };
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${key}`,
        JSON.stringify(autoSaveData)
      );
      console.log(`Auto-saved: ${key}`);
    } catch (error) {
      console.error('Failed to auto-save:', error);
    }
  }

  /**
   * Load auto-saved data
   */
  loadAutoSave<T>(key: string): AutoSaveData | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (!stored) return null;

      const autoSaveData: AutoSaveData = JSON.parse(stored);
      return autoSaveData;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  /**
   * Check if auto-saved data exists
   */
  hasAutoSave(key: string): boolean {
    return localStorage.getItem(`${this.STORAGE_PREFIX}${key}`) !== null;
  }

  /**
   * Clear auto-saved data
   */
  clearAutoSave(key: string): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    this.hasUnsavedData.set(false);
    console.log(`Cleared auto-save: ${key}`);
  }

  /**
   * Get all auto-save keys
   */
  getAllAutoSaveKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        keys.push(key.replace(this.STORAGE_PREFIX, ''));
      }
    }
    return keys;
  }

  /**
   * Get age of auto-saved data in milliseconds
   */
  getAutoSaveAge(key: string): number | null {
    const autoSave = this.loadAutoSave(key);
    if (!autoSave) return null;
    return Date.now() - autoSave.timestamp;
  }

  /**
   * Format auto-save age for display
   */
  formatAutoSaveAge(key: string): string {
    const age = this.getAutoSaveAge(key);
    if (age === null) return 'Unknown';

    const seconds = Math.floor(age / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }

  /**
   * Clean up old auto-saves (older than 7 days)
   */
  cleanupOldAutoSaves(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
    const keys = this.getAllAutoSaveKeys();
    const now = Date.now();

    keys.forEach(key => {
      const autoSave = this.loadAutoSave(key);
      if (autoSave && (now - autoSave.timestamp) > maxAgeMs) {
        this.clearAutoSave(key);
        console.log(`Cleaned up old auto-save: ${key}`);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
