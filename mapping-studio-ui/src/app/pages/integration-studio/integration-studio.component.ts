import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

export type TransformKind =
  | 'direct'
  | 'date_format'
  | 'enum_map'
  | 'number_coerce'
  | 'default_value'
  | 'combine';

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
  /** date: input pattern; enum: map string A=B,C=D; default: fallback value; combine: second path */
  paramA: string;
  /** date: output pattern */
  paramB: string;
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
    paramB: ''
  },
  {
    id: 'r2',
    sourcePath: 'customer.status',
    targetKey: 'durum',
    transform: 'enum_map',
    paramA: 'A=AKTIF,B=PASIF,C=ASKIDA',
    paramB: ''
  },
  {
    id: 'r3',
    sourcePath: 'order.placed_at',
    targetKey: 'tarih',
    transform: 'date_format',
    paramA: 'yyyy-MM-dd',
    paramB: 'dd/MM/yyyy'
  },
  {
    id: 'r4',
    sourcePath: 'order.qty',
    targetKey: 'adet',
    transform: 'number_coerce',
    paramA: '',
    paramB: ''
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
    I18nPipe
  ],
  templateUrl: './integration-studio.component.html',
  styleUrl: './integration-studio.component.scss'
})
export class IntegrationStudioComponent implements OnInit {
  private readonly i18n = inject(I18nService);

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

  testOutput = signal<Record<string, unknown> | null>(null);
  validationOk = signal<boolean | null>(null);
  validationMessages = signal<string[]>([]);
  published = signal(false);

  readonly transformOptions = computed(() => {
    this.i18n.translations();
    const kinds: TransformKind[] = [
      'direct',
      'date_format',
      'enum_map',
      'number_coerce',
      'default_value',
      'combine'
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

  ngOnInit(): void {
    this.analyzePayload();
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
    this.validationOk.set(null);
    this.published.set(false);
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
    this.rules.update(rs => [
      ...rs,
      {
        id: `r_${Date.now()}`,
        sourcePath: paths[0] ?? '',
        targetKey: targets[0]?.key ?? '',
        transform: 'direct',
        paramA: '',
        paramB: ''
      }
    ]);
  }

  removeRule(rule: MappingRule): void {
    this.rules.update(rs => rs.filter(r => r !== rule));
  }

  patchRule(id: string, patch: Partial<MappingRule>): void {
    this.rules.update(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }

  patchTargetAt(index: number, patch: Partial<TargetField>): void {
    this.targetFields.update(rows => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  runTest(): void {
    this.published.set(false);
    this.parseError.set(null);
    let payload: unknown;
    try {
      payload = JSON.parse(this.sourceJson());
    } catch (e) {
      this.parseError.set(
        e instanceof Error ? e.message : this.i18n.translate('studio.invalidJson')
      );
      return;
    }

    const out: Record<string, unknown> = {};
    for (const rule of this.rules()) {
      let raw = getByPath(payload, rule.sourcePath);
      switch (rule.transform) {
        case 'direct':
          out[rule.targetKey] = raw as unknown;
          break;
        case 'date_format':
          out[rule.targetKey] = applyDateFormat(raw, rule.paramA, rule.paramB);
          break;
        case 'enum_map': {
          const map = parseEnumMap(rule.paramA);
          const k = String(raw ?? '');
          out[rule.targetKey] = map[k] ?? raw;
          break;
        }
        case 'number_coerce':
          out[rule.targetKey] =
            raw === null || raw === undefined || raw === '' ? null : Number(raw);
          break;
        case 'default_value':
          if (raw === null || raw === undefined || raw === '') {
            out[rule.targetKey] = rule.paramA;
          } else {
            out[rule.targetKey] = raw as unknown;
          }
          break;
        case 'combine': {
          const b = getByPath(payload, rule.paramA);
          const parts = [raw, b].filter(v => v !== null && v !== undefined && v !== '');
          out[rule.targetKey] = parts.map(String).join(rule.paramB || ' ');
          break;
        }
      }
    }

    this.testOutput.set(out);

    const messages: string[] = [];
    let ok = true;
    for (const f of this.targetFields()) {
      if (!f.required) continue;
      const v = out[f.key];
      if (v === null || v === undefined || v === '') {
        ok = false;
        messages.push(this.i18n.translate('studio.validation.missing', { field: f.key }));
      }
    }
    if (ok) {
      messages.push(this.i18n.translate('studio.validation.allPresent'));
    }
    this.validationOk.set(ok);
    this.validationMessages.set(messages);
  }

  publishDemo(): void {
    this.runTest();
    if (this.validationOk() === true) {
      this.published.set(true);
    }
  }
}
