import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('json', json);

/** Pretty-print + highlight.js HTML (caller must sanitize for innerHTML). */
export function highlightJsonToHtml(raw: string): string {
  const obj = JSON.parse(raw);
  return highlightJsonValueToHtml(obj);
}

export function highlightJsonValueToHtml(value: unknown): string {
  const formatted = JSON.stringify(value, null, 2);
  return hljs.highlight(formatted, { language: 'json' }).value;
}
