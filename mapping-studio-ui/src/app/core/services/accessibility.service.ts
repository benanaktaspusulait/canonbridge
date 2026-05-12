import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';

/**
 * Accessibility Service
 * 
 * Provides utilities for screen reader announcements and accessibility features
 */
@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer: Renderer2;
  private liveRegion: HTMLElement | null = null;

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeLiveRegion();
  }

  /**
   * Initialize the ARIA live region for screen reader announcements
   */
  private initializeLiveRegion(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = this.renderer.createElement('div');
    this.renderer.setAttribute(this.liveRegion, 'aria-live', 'polite');
    this.renderer.setAttribute(this.liveRegion, 'aria-atomic', 'true');
    this.renderer.setAttribute(this.liveRegion, 'class', 'sr-only');
    this.renderer.appendChild(document.body, this.liveRegion);
  }

  /**
   * Announce a message to screen readers
   * @param message The message to announce
   * @param priority 'polite' (default) or 'assertive'
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    // Update the aria-live attribute
    this.renderer.setAttribute(this.liveRegion, 'aria-live', priority);

    // Clear previous message
    this.renderer.setProperty(this.liveRegion, 'textContent', '');

    // Set new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (this.liveRegion) {
        this.renderer.setProperty(this.liveRegion, 'textContent', message);
      }
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.renderer.setProperty(this.liveRegion, 'textContent', '');
      }
    }, 3000);
  }

  /**
   * Announce a validation error
   * @param fieldName The name of the field with the error
   * @param errorMessage The error message
   */
  announceError(fieldName: string, errorMessage: string): void {
    this.announce(`Error in ${fieldName}: ${errorMessage}`, 'assertive');
  }

  /**
   * Announce a success message
   * @param message The success message
   */
  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  /**
   * Announce a loading state
   * @param message The loading message
   */
  announceLoading(message: string): void {
    this.announce(`Loading: ${message}`, 'polite');
  }

  /**
   * Announce completion of a loading state
   * @param message The completion message
   */
  announceLoadingComplete(message: string): void {
    this.announce(`Loaded: ${message}`, 'polite');
  }

  /**
   * Announce navigation change
   * @param pageName The name of the new page
   */
  announceNavigation(pageName: string): void {
    this.announce(`Navigated to ${pageName}`, 'polite');
  }

  /**
   * Announce dynamic content update
   * @param message The update message
   */
  announceUpdate(message: string): void {
    this.announce(message, 'polite');
  }
}
