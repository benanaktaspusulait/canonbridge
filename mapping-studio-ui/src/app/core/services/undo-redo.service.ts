import { Injectable, signal, computed } from '@angular/core';

export interface UndoRedoState<T> {
  data: T;
  timestamp: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService<T = unknown> {
  private readonly MAX_HISTORY_SIZE = 50;
  
  private readonly history = signal<UndoRedoState<T>[]>([]);
  private readonly currentIndex = signal<number>(-1);

  readonly canUndo = computed(() => this.currentIndex() > 0);
  readonly canRedo = computed(() => this.currentIndex() < this.history().length - 1);
  readonly historySize = computed(() => this.history().length);

  /**
   * Push a new state to the history
   */
  pushState(data: T, description?: string): void {
    const state: UndoRedoState<T> = {
      data: this.deepClone(data),
      timestamp: Date.now(),
      description
    };

    // Remove any states after current index (when undoing and then making a new change)
    const newHistory = this.history().slice(0, this.currentIndex() + 1);
    
    // Add new state
    newHistory.push(state);

    // Limit history size
    if (newHistory.length > this.MAX_HISTORY_SIZE) {
      newHistory.shift();
    } else {
      this.currentIndex.update(i => i + 1);
    }

    this.history.set(newHistory);
  }

  /**
   * Undo to previous state
   */
  undo(): T | null {
    if (!this.canUndo()) return null;

    this.currentIndex.update(i => i - 1);
    const state = this.history()[this.currentIndex()];
    return state ? this.deepClone(state.data) : null;
  }

  /**
   * Redo to next state
   */
  redo(): T | null {
    if (!this.canRedo()) return null;

    this.currentIndex.update(i => i + 1);
    const state = this.history()[this.currentIndex()];
    return state ? this.deepClone(state.data) : null;
  }

  /**
   * Get current state
   */
  getCurrentState(): T | null {
    const state = this.history()[this.currentIndex()];
    return state ? this.deepClone(state.data) : null;
  }

  /**
   * Get state at specific index
   */
  getStateAt(index: number): T | null {
    const state = this.history()[index];
    return state ? this.deepClone(state.data) : null;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history.set([]);
    this.currentIndex.set(-1);
  }

  /**
   * Get history metadata (without full data)
   */
  getHistoryMetadata(): Array<{ index: number; timestamp: number; description?: string; isCurrent: boolean }> {
    return this.history().map((state, index) => ({
      index,
      timestamp: state.timestamp,
      description: state.description,
      isCurrent: index === this.currentIndex()
    }));
  }

  /**
   * Jump to specific state in history
   */
  jumpToState(index: number): T | null {
    if (index < 0 || index >= this.history().length) return null;
    
    this.currentIndex.set(index);
    const state = this.history()[index];
    return state ? this.deepClone(state.data) : null;
  }

  /**
   * Deep clone an object
   */
  private deepClone(obj: T): T {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to clone object:', error);
      return obj;
    }
  }

  /**
   * Get undo description
   */
  getUndoDescription(): string | undefined {
    if (!this.canUndo()) return undefined;
    return this.history()[this.currentIndex() - 1]?.description;
  }

  /**
   * Get redo description
   */
  getRedoDescription(): string | undefined {
    if (!this.canRedo()) return undefined;
    return this.history()[this.currentIndex() + 1]?.description;
  }
}
