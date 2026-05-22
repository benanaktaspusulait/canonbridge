import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ApplicationRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type LangId = 'en' | 'tr';

function flattenTranslations(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenTranslations(v as Record<string, unknown>, key));
    } else if (v !== undefined) {
      out[key] = String(v);
    }
  }
  return out;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly title = inject(Title);
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  readonly lang = signal<LangId>('en');
  readonly translations = signal<Record<string, string>>({});
  readonly loaded = signal(false);

  async init(): Promise<void> {
    try {
      // Check URL query param first (?lang=tr)
      const urlLang = new URLSearchParams(window.location.search).get('lang') as LangId | null;
      const saved = localStorage.getItem('canonbridge.lang') as LangId | null;
      const browser = navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
      const initial = (urlLang === 'en' || urlLang === 'tr') ? urlLang
        : (saved === 'en' || saved === 'tr') ? saved
        : browser;
      await this.loadLang(initial);
    } catch (e) {
      console.error('i18n init failed', e);
      this.loaded.set(true);
    }
  }

  async setLang(id: LangId): Promise<void> {
    await this.loadLang(id);
  }

  translate(key: string, params?: Record<string, unknown>): string {
    let s = this.translations()[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.split(`{{${k}}}`).join(String(v));
      }
    }
    return s;
  }

  private async loadLang(id: LangId): Promise<void> {
    this.lang.set(id);
    localStorage.setItem('canonbridge.lang', id);
    this.document.documentElement.lang = id;
    const data = await firstValueFrom(this.http.get<Record<string, unknown>>(this.translationUrl(id)));
    this.translations.set(flattenTranslations(data));
    this.title.setTitle(this.translate('app.title'));
    this.loaded.set(true);
    this.appRef.tick();
  }

  private translationUrl(id: LangId): string {
    const baseHref = this.document.querySelector('base')?.getAttribute('href') || '/';
    const baseUrl = new URL(baseHref, this.document.location.origin);
    return new URL(`i18n/${id}.json`, baseUrl).pathname;
  }
}
