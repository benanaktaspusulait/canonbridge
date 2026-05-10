import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  JsonataCheckService,
  type JsonataBatchResultEntry
} from '../../core/services/jsonata-check.service';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import mappingEngine from 'jsonata';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { FieldsetModule } from 'primeng/fieldset';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

export type TransformKind =
  | 'direct'
  | 'date_format'
  | 'enum_map'
  | 'number_coerce'
  | 'default_value'
  | 'combine'
  | 'string_uppercase'
  | 'string_lowercase'
  | 'string_trim'
  | 'string_substring'
  | 'string_replace'
  | 'array_join'
  | 'array_element'
  | 'conditional_value'
  | 'template_string';

export interface TargetField {
  key: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
  description: string;
}

export interface MappingRule {
  id: string;
  sourcePath: string;
  targetKey: string;
  transform: TransformKind;
  /** date: input pattern; enum: map string; default: fallback; combine: second path; replace: find; substring: start; array_element: index; conditional: expected raw value */
  paramA: string;
  /** date: output pattern; combine: separator; replace: replacement; substring: length; conditional: value if match */
  paramB: string;
  /** conditional: value if no match */
  paramC: string;
  /** When non-empty: custom mapping logic on full payload → written to targetKey (replaces visual transform). */
  advancedExpression: string;
}

const DEMO_JSON = `{
  "customer": {
    "full_name": "Ayşe Yılmaz",
    "status": "A"
  },
  "order": {
    "placed_at": "2026-05-10",
    "qty": "4"
  }
}`;

const DEFAULT_TARGETS: TargetField[] = [
  { key: 'musteriAdi', type: 'string', required: true, description: 'Canonical customer display name' },
  { key: 'durum', type: 'string', required: true, description: 'Lifecycle state (AKTIF / PASIF / ASKIDA)' },
  { key: 'tarih', type: 'date', required: true, description: 'Order date (DD/MM/YYYY)' },
  { key: 'adet', type: 'number', required: true, description: 'Line quantity' }
];

const DEFAULT_RULES: MappingRule[] = [
  {
    id: 'r1',
    sourcePath: 'customer.full_name',
    targetKey: 'musteriAdi',
    transform: 'direct',
    paramA: '',
    paramB: '',
    paramC: '',
    advancedExpression: ''
  },
  {
    id: 'r2',
    sourcePath: 'customer.status',
    targetKey: 'durum',
    transform: 'enum_map',
    paramA: 'A=AKTIF,B=PASIF,C=ASKIDA',
    paramB: '',
    paramC: '',
    advancedExpression: ''
  },
  {
    id: 'r3',
    sourcePath: 'order.placed_at',
    targetKey: 'tarih',
    transform: 'date_format',
    paramA: 'yyyy-MM-dd',
    paramB: 'dd/MM/yyyy',
    paramC: '',
    advancedExpression: ''
  },
  {
    id: 'r4',
    sourcePath: 'order.qty',
    targetKey: 'adet',
    transform: 'number_coerce',
    paramA: '',
    paramB: '',
    paramC: '',
    advancedExpression: ''
  }
];

function formatPrimitive(v: unknown): string {
  if (v === null) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

function buildTreeNodes(value: unknown, path: string): TreeNode[] {
  if (value === null || value === undefined) {
    return [
      {
        key: path || 'null',
        label: `${path || 'root'} · null`,
        data: { path: path || 'root', type: 'null' }
      }
    ];
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => {
      const p = path ? `${path}[${i}]` : `[${i}]`;
      if (item !== null && typeof item === 'object') {
        return {
          key: p,
          label: `[${i}]`,
          data: { path: p, type: Array.isArray(item) ? 'array' : 'object' },
          children: buildTreeNodes(item, p)
        };
      }
      return {
        key: p,
        label: `[${i}] · ${formatPrimitive(item)}`,
        data: { path: p, type: typeof item }
      };
    });
  }
  if (typeof value === 'object') {
    return Object.keys(value as object).map(k => {
      const p = path ? `${path}.${k}` : k;
      const v = (value as Record<string, unknown>)[k];
      if (v !== null && typeof v === 'object') {
        return {
          key: p,
          label: k,
          data: { path: p, type: Array.isArray(v) ? 'array' : 'object' },
          children: buildTreeNodes(v, p)
        };
      }
      return {
        key: p,
        label: `${k} · ${formatPrimitive(v)}`,
        data: { path: p, type: typeof v }
      };
    });
  }
  return [{ key: path, label: formatPrimitive(value), data: { path, type: typeof value } }];
}

function collectLeafPaths(nodes: TreeNode[], out: string[]): void {
  for (const n of nodes) {
    if (n.children?.length) {
      collectLeafPaths(n.children, out);
    } else if (n.data?.path && typeof n.data.path === 'string') {
      out.push(n.data.path);
    }
  }
}

function getByPath(root: unknown, path: string): unknown {
  const normalized = path.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalized.split('.').filter(Boolean);
  let cur: unknown = root;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function parseEnumMap(s: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const part of s.split(/[,;]/).map(x => x.trim()).filter(Boolean)) {
    const eq = part.indexOf('=');
    if (eq > 0) m[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return m;
}

function applyDateFormat(value: unknown, inFmt: string, outFmt: string): string {
  if (typeof value !== 'string') return String(value ?? '');
  if (inFmt === 'yyyy-MM-dd' && outFmt === 'dd/MM/yyyy') {
    const [y, mo, d] = value.split('-');
    if (y && mo && d) return `${d}/${mo}/${y}`;
  }
  return value;
}

function applyTemplate(template: string, payload: unknown): string {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path: string) => {
    const v = getByPath(payload, path.trim());
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  });
}

/** Token inserted when appending a field path into the advanced editor. */
function normalizePathToken(path: string): string {
  return path.replace(/\[(\d+)\]/g, '.$1').trim() || '$';
}

async function evaluateMappingExpression(expression: string, data: unknown): Promise<unknown> {
  const compiled = mappingEngine(expression);
  return compiled.evaluate(data);
}

function stableNormalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableNormalize);
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = stableNormalize((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(stableNormalize(value));
  } catch {
    return '';
  }
}

function applyVisualTransform(rule: MappingRule, payload: unknown): unknown {
  const raw = getByPath(payload, rule.sourcePath);
  switch (rule.transform) {
    case 'direct':
      return raw;
    case 'date_format':
      return applyDateFormat(raw, rule.paramA, rule.paramB);
    case 'enum_map': {
      const map = parseEnumMap(rule.paramA);
      const k = String(raw ?? '');
      return map[k] ?? raw;
    }
    case 'number_coerce':
      return raw === null || raw === undefined || raw === '' ? null : Number(raw);
    case 'default_value':
      if (raw === null || raw === undefined || raw === '') {
        return rule.paramA;
      }
      return raw;
    case 'combine': {
      const b = getByPath(payload, rule.paramA);
      const parts = [raw, b].filter(v => v !== null && v !== undefined && v !== '');
      return parts.map(String).join(rule.paramB || ' ');
    }
    case 'string_uppercase':
      return String(raw ?? '').toUpperCase();
    case 'string_lowercase':
      return String(raw ?? '').toLowerCase();
    case 'string_trim':
      return String(raw ?? '').trim();
    case 'string_substring': {
      const start = Math.max(0, parseInt(rule.paramA, 10) || 0);
      const len = parseInt(rule.paramB, 10);
      const s = String(raw ?? '');
      if (Number.isNaN(len)) return s.slice(start);
      return s.slice(start, start + len);
    }
    case 'string_replace': {
      const s = String(raw ?? '');
      const find = rule.paramA;
      if (!find) return s;
      return s.split(find).join(rule.paramB);
    }
    case 'array_join':
      if (!Array.isArray(raw)) return raw;
      return raw.map(String).join(rule.paramA || ',');
    case 'array_element': {
      const i = parseInt(rule.paramA, 10) || 0;
      if (!Array.isArray(raw)) return undefined;
      return raw[i];
    }
    case 'conditional_value':
      return String(raw ?? '') === rule.paramA ? rule.paramB : rule.paramC;
    case 'template_string':
      return applyTemplate(rule.paramA, payload);
    default:
      return raw;
  }
}

@Component({
  selector: 'app-integration-studio',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    JsonPipe,
    TreeModule,
    CardModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    TableModule,
    TagModule,
    DividerModule,
    TooltipModule,
    ToggleSwitchModule,
    MessageModule,
    InputTextModule,
    TabsModule,
    FieldsetModule,
    ScrollPanelModule,
    I18nPipe
  ],
  templateUrl: './integration-studio.component.html',
  styleUrl: './integration-studio.component.scss'
})
export class IntegrationStudioComponent implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly jsonataCheck = inject(JsonataCheckService);

  /** When `mapping.transformerApiUrl` is set, advanced formulas are mirrored to the transformer for validation. */
  get transformerConfigured(): boolean {
    return this.jsonataCheck.isConfigured;
  }

  readonly steps = [
    { id: 0, labelKey: 'studio.step.source' },
    { id: 1, labelKey: 'studio.step.canonical' },
    { id: 2, labelKey: 'studio.step.mapping' },
    { id: 3, labelKey: 'studio.step.validate' }
  ];

  activeStep = signal(0);
  sourceJson = signal(DEMO_JSON);
  parseError = signal<string | null>(null);
  treeNodes = signal<TreeNode[]>([]);
  sourcePaths = signal<string[]>([]);

  targetFields = signal<TargetField[]>([...DEFAULT_TARGETS]);
  rules = signal<MappingRule[]>(DEFAULT_RULES.map(r => ({ ...r })));

  selectedRule = signal<MappingRule | null>(null);
  ruleInspectorTab = signal<string>('visual');

  testOutput = signal<Record<string, unknown> | null>(null);
  altFixtureJson = signal('');
  altTestOutput = signal<Record<string, unknown> | null>(null);
  altParseError = signal<string | null>(null);
  validationOk = signal<boolean | null>(null);
  validationMessages = signal<string[]>([]);
  ruleEvalErrors = signal<Record<string, string>>({});
  /** Server JSONata diagnostics for the alternate fixture run (step 4). */
  altTransformerMessages = signal<string[]>([]);
  published = signal(false);

  readonly transformOptions = computed(() => {
    this.i18n.translations();
    const kinds: TransformKind[] = [
      'direct',
      'date_format',
      'enum_map',
      'number_coerce',
      'default_value',
      'combine',
      'string_uppercase',
      'string_lowercase',
      'string_trim',
      'string_substring',
      'string_replace',
      'array_join',
      'array_element',
      'conditional_value',
      'template_string'
    ];
    return kinds.map(value => ({
      value,
      label: this.i18n.translate(`studio.transform.${value}`)
    }));
  });

  readonly fieldTypeOptions = computed(() => {
    this.i18n.translations();
    return (['string', 'number', 'date'] as const).map(value => ({
      value,
      label: this.i18n.translate(`studio.fieldType.${value}`)
    }));
  });

  readonly sourcePathOptions = computed(() =>
    this.sourcePaths().map(p => ({ label: p, value: p }))
  );

  readonly targetKeyOptions = computed(() =>
    this.targetFields().map(f => ({ label: f.key, value: f.key }))
  );

  readonly pathChips = computed(() => this.sourcePaths().slice(0, 12));

  ngOnInit(): void {
    this.analyzePayload();
    this.selectedRule.set(this.rules()[0] ?? null);
  }

  stepClass(i: number): string {
    const a = this.activeStep();
    if (i < a) return 'done';
    if (i === a) return 'active';
    return '';
  }

  setStep(i: number): void {
    this.activeStep.set(Math.max(0, Math.min(3, i)));
  }

  nextStep(): void {
    this.setStep(this.activeStep() + 1);
  }

  prevStep(): void {
    this.setStep(this.activeStep() - 1);
  }

  analyzePayload(): void {
    this.parseError.set(null);
    this.testOutput.set(null);
    this.altTestOutput.set(null);
    this.altParseError.set(null);
    this.altTransformerMessages.set([]);
    this.validationOk.set(null);
    this.published.set(false);
    this.ruleEvalErrors.set({});
    try {
      const parsed = JSON.parse(this.sourceJson()) as unknown;
      const nodes = buildTreeNodes(parsed, '');
      const paths: string[] = [];
      collectLeafPaths(nodes, paths);
      this.treeNodes.set(nodes);
      this.sourcePaths.set(paths);
    } catch (e) {
      this.treeNodes.set([]);
      this.sourcePaths.set([]);
      this.parseError.set(
        e instanceof Error ? e.message : this.i18n.translate('studio.invalidJson')
      );
    }
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.sourceJson.set(String(reader.result ?? ''));
      this.analyzePayload();
    };
    reader.readAsText(file);
    input.value = '';
  }

  addTargetField(): void {
    this.targetFields.update(rows => [
      ...rows,
      { key: `field_${rows.length + 1}`, type: 'string', required: false, description: '' }
    ]);
  }

  removeTargetAt(index: number): void {
    this.targetFields.update(rows => rows.filter((_, i) => i !== index));
  }

  addRule(): void {
    const paths = this.sourcePaths();
    const targets = this.targetFields();
    const newRule: MappingRule = {
      id: `r_${Date.now()}`,
      sourcePath: paths[0] ?? '',
      targetKey: targets[0]?.key ?? '',
      transform: 'direct',
      paramA: '',
      paramB: '',
      paramC: '',
      advancedExpression: ''
    };
    this.rules.update(rs => [...rs, newRule]);
    const added = this.rules().find(r => r.id === newRule.id) ?? null;
    this.selectedRule.set(added);
    this.ruleInspectorTab.set('visual');
  }

  removeRule(rule: MappingRule): void {
    const id = rule.id;
    this.rules.update(rs => rs.filter(r => r !== rule));
    if (this.selectedRule()?.id === id) {
      this.selectedRule.set(this.rules()[0] ?? null);
    }
  }

  patchRule(id: string, patch: Partial<MappingRule>): void {
    this.rules.update(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)));
    if (this.selectedRule()?.id === id) {
      const next = this.rules().find(r => r.id === id) ?? null;
      this.selectedRule.set(next);
    }
  }

  patchTargetAt(index: number, patch: Partial<TargetField>): void {
    this.targetFields.update(rows => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  onRuleSelectionChange(rule: MappingRule | null): void {
    this.selectedRule.set(rule);
    this.ruleInspectorTab.set('visual');
  }

  onInspectorTabChange(value: string | number | undefined): void {
    this.ruleInspectorTab.set(value === undefined || value === null ? 'visual' : `${value}`);
  }

  ruleUsesAdvancedLogic(rule: MappingRule): boolean {
    return Boolean(rule.advancedExpression?.trim());
  }

  ruleSummaryText(rule: MappingRule | null): string {
    if (!rule) return '';
    this.i18n.translations();
    if (rule.advancedExpression?.trim()) {
      return this.i18n.translate('studio.summary.advanced', { target: rule.targetKey });
    }
    const path = rule.sourcePath || '—';
    const target = rule.targetKey;
    const t = (key: string, params: Record<string, unknown>) => this.i18n.translate(key, params);
    switch (rule.transform) {
      case 'direct':
        return t('studio.summary.direct', { path, target });
      case 'date_format':
        return t('studio.summary.dateFormat', {
          path,
          target,
          inFmt: rule.paramA || '—',
          outFmt: rule.paramB || '—'
        });
      case 'enum_map':
        return t('studio.summary.enumMap', { path, target });
      case 'number_coerce':
        return t('studio.summary.numberCoerce', { path, target });
      case 'default_value':
        return t('studio.summary.defaultValue', { path, target, fallback: rule.paramA || '—' });
      case 'combine':
        return t('studio.summary.combine', {
          path,
          path2: rule.paramA || '—',
          target,
          sep: rule.paramB || ' '
        });
      case 'string_uppercase':
        return t('studio.summary.stringUppercase', { path, target });
      case 'string_lowercase':
        return t('studio.summary.stringLowercase', { path, target });
      case 'string_trim':
        return t('studio.summary.stringTrim', { path, target });
      case 'string_substring': {
        const lenPhrase = rule.paramB?.trim()
          ? t('studio.summary.substrLenPhrase', { n: rule.paramB })
          : t('studio.summary.substrToEndPhrase', {});
        return t('studio.summary.stringSubstring', { path, target, start: rule.paramA || '0', lenPhrase });
      }
      case 'string_replace':
        return t('studio.summary.stringReplace', {
          path,
          target,
          from: rule.paramA || '—',
          to: rule.paramB || '—'
        });
      case 'array_join':
        return t('studio.summary.arrayJoin', { path, target, delim: rule.paramA || ',' });
      case 'array_element':
        return t('studio.summary.arrayElement', { path, target, index: rule.paramA || '0' });
      case 'conditional_value':
        return t('studio.summary.conditional', {
          path,
          target,
          when: rule.paramA || '—',
          thenVal: rule.paramB || '—',
          elseVal: rule.paramC || '—'
        });
      case 'template_string':
        return t('studio.summary.template', { target });
      default:
        return t('studio.summary.direct', { path, target });
    }
  }

  appendPathToAdvancedEditor(path: string): void {
    const rule = this.selectedRule();
    if (!rule) return;
    const cur = rule.advancedExpression.trim();
    const sep = cur && !cur.endsWith(' ') ? ' ' : '';
    const token = normalizePathToken(path);
    this.patchRule(rule.id, { advancedExpression: `${cur}${sep}${token}` });
  }

  async copyRuleSummary(): Promise<void> {
    const rule = this.selectedRule();
    if (!rule) return;
    const text = this.ruleSummaryText(rule);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  private async enrichWithServerJsonata(
    payload: unknown,
    out: Record<string, unknown>,
    mergedErrors: Record<string, string>
  ): Promise<{ mergedErrors: Record<string, string>; extraNotes: string[] }> {
    const merged = { ...mergedErrors };
    const extraNotes: string[] = [];
    const advanced = this.rules().filter(r => r.advancedExpression?.trim());
    if (!advanced.length) {
      return { mergedErrors: merged, extraNotes };
    }
    try {
      const resp = await this.jsonataCheck.checkBatch(
        payload,
        advanced.map(r => ({
          ruleId: r.id,
          expression: r.advancedExpression!.trim()
        }))
      );
      if (!resp) {
        return { mergedErrors: merged, extraNotes };
      }
      for (const r of advanced) {
        const res = resp.results[r.id] as JsonataBatchResultEntry | undefined;
        if (!res) continue;
        if (res.ok === false) {
          const stage = res.stage ?? 'evaluate';
          const msg = res.message ?? 'Unknown error';
          merged[r.id] = merged[r.id] ? `${merged[r.id]} | Transformer (${stage}): ${msg}` : `Transformer (${stage}): ${msg}`;
        } else if (!merged[r.id] && stableStringify(out[r.targetKey]) !== stableStringify(res.result)) {
          extraNotes.push(
            this.i18n.translate('studio.validation.serverBrowserMismatch', { field: r.targetKey })
          );
        }
      }
    } catch {
      extraNotes.push(this.i18n.translate('studio.validation.transformerUnreachable'));
    }
    return { mergedErrors: merged, extraNotes };
  }

  private async executeRulesOnPayload(
    payload: unknown
  ): Promise<{ out: Record<string, unknown>; errors: Record<string, string> }> {
    const out: Record<string, unknown> = {};
    const errors: Record<string, string> = {};
    for (const rule of this.rules()) {
      try {
        if (rule.advancedExpression?.trim()) {
          const r = await evaluateMappingExpression(rule.advancedExpression.trim(), payload);
          out[rule.targetKey] = r as unknown;
        } else {
          out[rule.targetKey] = applyVisualTransform(rule, payload) as unknown;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors[rule.id] = msg;
        out[rule.targetKey] = null;
      }
    }
    return { out, errors };
  }

  async runTest(): Promise<void> {
    this.published.set(false);
    this.parseError.set(null);
    this.altParseError.set(null);
    let payload: unknown;
    try {
      payload = JSON.parse(this.sourceJson());
    } catch (e) {
      this.parseError.set(
        e instanceof Error ? e.message : this.i18n.translate('studio.invalidJson')
      );
      return;
    }

    const { out, errors } = await this.executeRulesOnPayload(payload);
    const enriched = await this.enrichWithServerJsonata(payload, out, errors);
    this.testOutput.set(out);
    this.ruleEvalErrors.set(enriched.mergedErrors);

    const messages = [...enriched.extraNotes];
    let ok = true;
    for (const f of this.targetFields()) {
      if (!f.required) continue;
      const v = out[f.key];
      if (v === null || v === undefined || v === '') {
        ok = false;
        messages.push(this.i18n.translate('studio.validation.missing', { field: f.key }));
      }
    }
    const errIds = Object.keys(enriched.mergedErrors);
    if (errIds.length) {
      ok = false;
      for (const id of errIds) {
        const rule = this.rules().find(r => r.id === id);
        const label = rule?.targetKey ?? id;
        messages.push(this.i18n.translate('studio.validation.ruleEvalFailed', { field: label }));
      }
    }
    if (ok) {
      messages.push(this.i18n.translate('studio.validation.allPresent'));
    }
    this.validationOk.set(ok);
    this.validationMessages.set(messages);
  }

  async runAltFixture(): Promise<void> {
    const raw = this.altFixtureJson().trim();
    if (!raw) {
      this.altTestOutput.set(null);
      this.altParseError.set(null);
      this.altTransformerMessages.set([]);
      return;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      this.altTestOutput.set(null);
      this.altParseError.set(
        e instanceof Error ? e.message : this.i18n.translate('studio.invalidJson')
      );
      return;
    }
    this.altParseError.set(null);
    this.altTransformerMessages.set([]);
    const { out, errors } = await this.executeRulesOnPayload(payload);
    this.altTestOutput.set(out);

    const advanced = this.rules().filter(r => r.advancedExpression?.trim());
    if (!advanced.length) {
      return;
    }
    const enriched = await this.enrichWithServerJsonata(payload, out, errors);
    const msgs: string[] = [...enriched.extraNotes];
    for (const r of advanced) {
      const m = enriched.mergedErrors[r.id];
      const base = errors[r.id];
      if (m && m !== base) {
        msgs.push(this.i18n.translate('studio.validation.altTransformerNote', { field: r.targetKey, detail: m }));
      }
    }
    if (msgs.length) {
      this.altTransformerMessages.set(msgs);
    }
  }

  async publishDemo(): Promise<void> {
    await this.runTest();
    if (this.validationOk() === true) {
      this.published.set(true);
    }
  }
}
