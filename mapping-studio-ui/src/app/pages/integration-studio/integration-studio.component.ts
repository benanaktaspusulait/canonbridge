import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  JsonataCheckService,
  type JsonataBatchResultEntry
} from '../../core/services/jsonata-check.service';
import { KeyboardShortcutsService } from '../../core/services/keyboard-shortcuts.service';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { MappingService, MappingDraft } from '../../core/services/mapping.service';
import { AutoSaveService } from '../../core/services/auto-save.service';
import { UndoRedoService } from '../../core/services/undo-redo.service';
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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
import { targetFieldsFromCanonicalPayloadProperties } from './canonical-fields-from-schema';
import { collectSchemaValuePaths, isRootObjectSchema } from './json-schema-walk';
import type {
  FixtureRow,
  MappingRule,
  SourceValidationKind,
  SourceValidationRule,
  TargetField,
  TransformKind
} from './integration-studio.models';
import { buildCombinedMappingExpression } from './rule-to-jsonata';
import {
  createStudioAjv,
  formatAjvIssueForList,
  instancePathToTargetKey,
  validateWithAjv,
  type AjvIssue
} from './studio-ajv';
import { highlightJsonToHtml, highlightJsonValueToHtml } from './json-highlight';
import { JsonataPreviewPanelComponent } from './jsonata-preview-panel.component';
import { NestedMappingDialogComponent } from './nested-mapping-dialog.component';

const TARGET_KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;
type UploadDropTarget = string;
type StudioSourceType =
  | 'kafka'
  | 'webhook'
  | 'restApi'
  | 'externalApi'
  | 'soap'
  | 'fileBatch'
  | 'apiEnrichment'
  | 'manual';
type BackendSourceType =
  | 'KAFKA'
  | 'WEBHOOK'
  | 'REST_API'
  | 'SCHEDULED_API'
  | 'SOAP'
  | 'FILE_BATCH'
  | 'API_ENRICHMENT'
  | 'MANUAL';
type SourceAuthType = 'API_KEY' | 'BASIC_AUTH' | 'BEARER_TOKEN' | 'OAUTH2_CLIENT_CREDENTIALS';
type ExternalApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type CredentialOption = {
  id: string;
  name: string;
  type: SourceAuthType;
  environment: 'Sandbox' | 'Production';
  lastUsed: string;
};

type StudioConfigExport = {
  version: 1;
  exportedAt: string;
  sourceType: StudioSourceType;
  sourceJson: string;
  sourceFileMeta: { name: string; size: string } | null;
  inputSchemaDoc: Record<string, unknown> | null;
  inputSchemaMeta: { title?: string; $id?: string } | null;
  canonicalSchemaDoc: Record<string, unknown> | null;
  canonicalSchemaMeta: { title?: string; $id?: string } | null;
  targetFields: TargetField[];
  rules: MappingRule[];
  sourceValidationRules: SourceValidationRule[];
  kafka?: {
    topic: string;
    consumerGroup: string;
  };
  externalApi: {
    name: string;
    method: ExternalApiMethod;
    url: string;
    schedule: string;
    selectedCredentialId: string;
  };
  restApi?: {
    method: ExternalApiMethod;
    path: string;
    authType: SourceAuthType;
  };
  soap?: {
    endpoint: string;
    soapAction: string;
    operation: string;
  };
  fileBatch?: {
    format: 'CSV' | 'JSONL' | 'JSON_ARRAY';
    delimiter: string;
    hasHeaderRow: boolean;
  };
  apiEnrichment?: {
    lookupName: string;
    method: ExternalApiMethod;
    urlTemplate: string;
    selectedCredentialId: string;
    failurePolicy: 'DLQ' | 'SKIP_ENRICHMENT' | 'RETRY';
  };
  credentials: CredentialOption[];
  webhook: {
    url: string;
    keyMasked: string;
  };
  fixtures: FixtureRow[];
};

type EnumMapPair = { source: string; target: string };
type RuleStatusSeverity = 'success' | 'warn' | 'danger' | 'info' | 'secondary';

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

function setByPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.').map(part => part.trim()).filter(Boolean);
  if (!parts.length) return;
  let cur: Record<string, unknown> = root;
  for (const part of parts.slice(0, -1)) {
    const next = cur[part];
    if (next === null || typeof next !== 'object' || Array.isArray(next)) {
      cur[part] = {};
    }
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    const n = Number(value);
    return Number.isFinite(n) ? [n] : [];
  }
  return value
    .map(item => Number(item))
    .filter(n => Number.isFinite(n));
}

function firstRecordInArray(value: unknown): Record<string, unknown> | null {
  if (!Array.isArray(value)) return null;
  const found = value.find(item => item !== null && typeof item === 'object' && !Array.isArray(item));
  return (found as Record<string, unknown> | undefined) ?? null;
}

function parseEnumPairs(s: string): EnumMapPair[] {
  const trimmed = s.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => {
          if (!item || typeof item !== 'object') return null;
          const row = item as Record<string, unknown>;
          return {
            source: String(row['source'] ?? ''),
            target: String(row['target'] ?? '')
          };
        })
        .filter((row): row is EnumMapPair => Boolean(row));
    }
  } catch {
    /* legacy comma syntax */
  }
  return s
    .split(/[,;]/)
    .map(x => x.trim())
    .filter(Boolean)
    .map(part => {
      const eq = part.indexOf('=');
      return eq > 0 ? { source: part.slice(0, eq).trim(), target: part.slice(eq + 1).trim() } : null;
    })
    .filter((row): row is EnumMapPair => Boolean(row));
}

function serializeEnumPairs(rows: EnumMapPair[]): string {
  return JSON.stringify(rows.map(row => ({
    source: row.source,
    target: row.target
  })));
}

function parseEnumMap(s: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const row of parseEnumPairs(s)) {
    if (row.source.trim() && row.target.trim()) m[row.source.trim()] = row.target.trim();
  }
  return m;
}

function uniqueSelectOptions(values: string[]): { label: string; value: string }[] {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))].map(value => ({ label: value, value }));
}

function pathToInstancePath(path: string): string {
  return `/${path.replace(/\[(\d+)\]/g, '/$1').replace(/\./g, '/')}`;
}

function sourceValueType(value: unknown): 'array' | 'object' | 'null' | 'string' | 'number' | 'boolean' {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value as 'object' | 'string' | 'number' | 'boolean';
}

function parseCsvValues(value: string): string[] {
  return value
    .split(/[,;]/)
    .map(item => item.trim())
    .filter(Boolean);
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

function parseDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map(cell => cell.trim());
}

function csvToJsonArray(text: string, delimiter = ',', hasHeaderRow = true): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const firstRow = parseDelimitedLine(lines[0], delimiter);
  const headers = hasHeaderRow
    ? firstRow.map((header, index) => header || `column_${index + 1}`)
    : firstRow.map((_, index) => `column_${index + 1}`);
  const dataLines = hasHeaderRow ? lines.slice(1) : lines;
  return dataLines.map(line => {
    const cells = parseDelimitedLine(line, delimiter);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? '';
      return row;
    }, {});
  });
}

function xmlElementToJson(element: Element): unknown {
  const children = Array.from(element.children);
  const attributes = Array.from(element.attributes).reduce<Record<string, string>>((acc, attr) => {
    acc[`@${attr.name}`] = attr.value;
    return acc;
  }, {});
  const text = element.textContent?.trim() ?? '';
  if (!children.length) {
    return Object.keys(attributes).length ? { ...attributes, '#text': text } : text;
  }
  const body = children.reduce<Record<string, unknown>>((acc, child) => {
    const key = child.localName || child.nodeName;
    const value = xmlElementToJson(child);
    if (acc[key] === undefined) {
      acc[key] = value;
    } else if (Array.isArray(acc[key])) {
      (acc[key] as unknown[]).push(value);
    } else {
      acc[key] = [acc[key], value];
    }
    return acc;
  }, attributes);
  return body;
}

function xmlTextToJsonObject(text: string): Record<string, unknown> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(parserError.textContent?.trim() || 'Invalid XML');
  }
  const root = doc.documentElement;
  return { [root.localName || root.nodeName]: xmlElementToJson(root) };
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

function previewString(value: unknown): string {
  if (value === undefined) return '—';
  let raw: string;
  if (typeof value === 'string') {
    raw = `"${value}"`;
  } else {
    try {
      raw = JSON.stringify(value);
    } catch {
      raw = String(value);
    }
  }
  return raw.length > 96 ? `${raw.slice(0, 93)}...` : raw;
}

function effectiveJsonataExpression(rule: MappingRule): string | undefined {
  const j = rule.jsonataExpression?.trim();
  if (j) return j;
  const a = rule.advancedExpression?.trim();
  return a || undefined;
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
    case 'array_first':
      return Array.isArray(raw) ? raw[0] : undefined;
    case 'array_last':
      return Array.isArray(raw) ? raw[raw.length - 1] : undefined;
    case 'array_element': {
      const i = Math.max(1, parseInt(rule.paramA, 10) || 1) - 1;
      if (!Array.isArray(raw)) return undefined;
      return raw[i];
    }
    case 'array_count':
      return Array.isArray(raw) ? raw.length : 0;
    case 'array_filter_equals':
      if (!Array.isArray(raw)) return [];
      return raw.filter(item => String(getByPath(item, rule.paramA) ?? '') === rule.paramB);
    case 'math_sum': {
      const numbers = asNumberArray(raw);
      return numbers.reduce((sum, n) => sum + n, 0);
    }
    case 'math_average': {
      const numbers = asNumberArray(raw);
      if (!numbers.length) return null;
      return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    }
    case 'math_min': {
      const numbers = asNumberArray(raw);
      return numbers.length ? Math.min(...numbers) : null;
    }
    case 'math_max': {
      const numbers = asNumberArray(raw);
      return numbers.length ? Math.max(...numbers) : null;
    }
    case 'conditional_value':
      return String(raw ?? '') === rule.paramA ? rule.paramB : rule.paramC;
    case 'template_string':
      return applyTemplate(rule.paramA, payload);
    default:
      return raw;
  }
}

const STUDIO_DRAFT_STORAGE_KEY = 'canonbridge:studio:draft';
const STUDIO_EXTERNAL_SAMPLE_KEY = 'canonbridge:external-systems:selected-sample';

@Component({
  selector: 'app-integration-studio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  imports: [
    FormsModule,
    RouterLink,
    JsonPipe,
    DragDropModule,
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
    ToastModule,
    I18nPipe,
    JsonataPreviewPanelComponent,
    NestedMappingDialogComponent
  ],
  templateUrl: './integration-studio.component.html',
  styleUrl: './integration-studio.component.scss'
})
export class IntegrationStudioComponent implements OnInit, OnDestroy {
  private readonly i18n = inject(I18nService);
  private readonly jsonataCheck = inject(JsonataCheckService);
  private readonly shortcuts = inject(KeyboardShortcutsService);
  private readonly a11y = inject(AccessibilityService);
  private readonly mappingService = inject(MappingService);
  private readonly autoSaveSvc = inject(AutoSaveService);
  private readonly undoRedoSvc: UndoRedoService<MappingRule[]> = inject(UndoRedoService);
  private readonly ajv = createStudioAjv();
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toast = inject(MessageService);

  readonly backendDraftId = signal<string | null>(null);

  @ViewChild('advancedExpr') private advancedExpr?: ElementRef<HTMLTextAreaElement>;

  private sourceDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  private autosaveTimer: ReturnType<typeof setInterval> | undefined;

  /** When `mapping.transformerApiUrl` is set, advanced formulas are mirrored to the transformer for validation. */
  get transformerConfigured(): boolean {
    return this.jsonataCheck.isConfigured;
  }

  readonly steps = [
    { id: 0, labelKey: 'studio.step.source' },
    { id: 1, labelKey: 'studio.step.canonical' },
    { id: 2, labelKey: 'studio.step.mapping' },
    { id: 3, labelKey: 'studio.step.unfinished' },
    { id: 4, labelKey: 'studio.step.validate' }
  ];

  /** Highest step index the user may open (sequential wizard). */
  maxUnlockedStep = signal(0);
  testRunPending = signal(false);
  lastAutosavedAt = signal<string | null>(null);
  draftSourceLabel = signal<string | null>(null);
  sourceDropHighlight = signal(false);
  uploadDropTarget = signal<UploadDropTarget | null>(null);
  sourceFileMeta = signal<{ name: string; size: string } | null>(null);
  sourceType = signal<StudioSourceType>('manual');
  kafkaTopic = signal('');
  kafkaConsumerGroup = signal('');
  restApiMethod = signal<ExternalApiMethod>('POST');
  restApiPath = signal('');
  restApiAuthType = signal<SourceAuthType>('API_KEY');
  externalApiMethod = signal<ExternalApiMethod>('GET');
  externalApiUrl = signal('');
  externalApiName = signal('');
  externalApiSchedule = signal('');
  soapEndpoint = signal('');
  soapAction = signal('');
  soapOperation = signal('');
  fileBatchFormat = signal<'CSV' | 'JSONL' | 'JSON_ARRAY'>('CSV');
  fileBatchDelimiter = signal(',');
  fileBatchHasHeaderRow = signal(true);
  enrichmentLookupName = signal('');
  enrichmentMethod = signal<ExternalApiMethod>('GET');
  enrichmentUrlTemplate = signal('');
  enrichmentFailurePolicy = signal<'DLQ' | 'SKIP_ENRICHMENT' | 'RETRY'>('RETRY');
  externalApiLastTest = signal<{ status: number; durationMs: number; capturedAt: string } | null>(null);
  externalApiLastError = signal<string | null>(null);
  authDrawerOpen = signal(false);
  authType = signal<SourceAuthType>('API_KEY');
  credentialName = signal('');
  credentialHeaderName = signal('X-API-Key');
  credentialValue = signal('');
  credentialUsername = signal('');
  credentialPassword = signal('');
  credentialTokenUrl = signal('');
  credentialClientId = signal('');
  credentialClientSecret = signal('');
  credentialScope = signal('');
  credentials = signal<CredentialOption[]>([]);
  selectedCredentialId = signal('');
  webhookUrl = signal('');
  webhookKeyMasked = signal('');

  activeStep = signal(0);
  sourceJson = signal('');
  parseError = signal<string | null>(null);
  treeNodes = signal<TreeNode[]>([]);
  sourcePaths = signal<string[]>([]);
  sourceValidationRules = signal<SourceValidationRule[]>([]);

  targetFields = signal<TargetField[]>([]);
  rules = signal<MappingRule[]>([]);

  selectedRule = signal<MappingRule | null>(null);
  ruleInspectorTab = signal<string>('visual');
  readonly canUndoRules = computed(() => this.undoRedoSvc.canUndo());
  readonly canRedoRules = computed(() => this.undoRedoSvc.canRedo());
  readonly showExpertMode = signal(false);

  nestedMappingVisible = false;
  readonly nestedMappingParentRule = signal<MappingRule | null>(null);

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

  readonly inputSchemaMeta = signal<{ title?: string; $id?: string } | null>(null);
  readonly inputSchemaDoc = signal<Record<string, unknown> | null>(null);
  readonly inputSchemaLoadError = signal<string | null>(null);
  readonly inputSchemaValidationIssues = signal<AjvIssue[]>([]);
  readonly inputSchemaPathSuggestions = signal<string[]>([]);

  readonly canonicalSchemaMeta = signal<{ title?: string; $id?: string } | null>(null);
  readonly canonicalSchemaDoc = signal<Record<string, unknown> | null>(null);
  readonly canonicalSchemaLoadError = signal<string | null>(null);
  readonly canonicalSchemaIssuesDetail = signal<{ targetKey: string | null; text: string }[]>([]);
  readonly rulesWithOutputSchemaErrors = signal<Set<string>>(new Set());

  validateStepTab = signal<'test' | 'fixtures' | 'expression'>('test');
  fixtures = signal<FixtureRow[]>([]);
  fixtureRunSummary = signal<string | null>(null);
  fixtureConfigMessage = signal<{ severity: 'info' | 'error'; text: string } | null>(null);
  selectedFixtureDetailId = signal<string | null>(null);

  readonly sourceTypeCards: {
    id: StudioSourceType;
    icon: string;
    titleKey: string;
    descKey: string;
    hintKey: string;
  }[] = [
    {
      id: 'kafka',
      icon: 'pi pi-send',
      titleKey: 'studio.sourceType.kafka',
      descKey: 'studio.sourceType.kafkaDesc',
      hintKey: 'studio.sourceType.kafkaHint'
    },
    {
      id: 'webhook',
      icon: 'pi pi-link',
      titleKey: 'studio.sourceType.webhook',
      descKey: 'studio.sourceType.webhookDesc',
      hintKey: 'studio.sourceType.webhookHint'
    },
    {
      id: 'restApi',
      icon: 'pi pi-globe',
      titleKey: 'studio.sourceType.restApi',
      descKey: 'studio.sourceType.restApiDesc',
      hintKey: 'studio.sourceType.restApiHint'
    },
    {
      id: 'externalApi',
      icon: 'pi pi-cloud-download',
      titleKey: 'studio.sourceType.externalApi',
      descKey: 'studio.sourceType.externalApiDesc',
      hintKey: 'studio.sourceType.externalApiHint'
    },
    {
      id: 'soap',
      icon: 'pi pi-code',
      titleKey: 'studio.sourceType.soap',
      descKey: 'studio.sourceType.soapDesc',
      hintKey: 'studio.sourceType.soapHint'
    },
    {
      id: 'fileBatch',
      icon: 'pi pi-file',
      titleKey: 'studio.sourceType.fileBatch',
      descKey: 'studio.sourceType.fileBatchDesc',
      hintKey: 'studio.sourceType.fileBatchHint'
    },
    {
      id: 'apiEnrichment',
      icon: 'pi pi-sitemap',
      titleKey: 'studio.sourceType.apiEnrichment',
      descKey: 'studio.sourceType.apiEnrichmentDesc',
      hintKey: 'studio.sourceType.apiEnrichmentHint'
    },
    {
      id: 'manual',
      icon: 'pi pi-upload',
      titleKey: 'studio.sourceType.manual',
      descKey: 'studio.sourceType.manualDesc',
      hintKey: 'studio.sourceType.manualHint'
    }
  ];
  readonly externalApiMethods: ExternalApiMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  readonly fileBatchFormats: ('CSV' | 'JSONL' | 'JSON_ARRAY')[] = ['CSV', 'JSONL', 'JSON_ARRAY'];
  readonly enrichmentFailurePolicies: ('DLQ' | 'SKIP_ENRICHMENT' | 'RETRY')[] = ['RETRY', 'DLQ', 'SKIP_ENRICHMENT'];
  readonly authTypes: SourceAuthType[] = ['API_KEY', 'BASIC_AUTH', 'BEARER_TOKEN', 'OAUTH2_CLIENT_CREDENTIALS'];
  readonly selectedCredential = computed(() =>
    this.credentials().find(credential => credential.id === this.selectedCredentialId()) ?? null
  );

  readonly combinedExpressionPreview = computed(() => buildCombinedMappingExpression(this.rules()));

  readonly highlightedSourceHtml = computed((): SafeHtml | null => {
    try {
      const html = highlightJsonToHtml(this.sourceJson());
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch {
      return null;
    }
  });

  readonly highlightedOutputHtml = computed((): SafeHtml | null => {
    const o = this.testOutput();
    if (!o) return null;
    try {
      const html = highlightJsonValueToHtml(o);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch {
      return null;
    }
  });

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
      'array_first',
      'array_last',
      'array_element',
      'array_count',
      'array_filter_equals',
      'math_sum',
      'math_average',
      'math_min',
      'math_max',
      'conditional_value',
      'template_string'
    ];
    return kinds.map(value => ({
      value,
      label: this.i18n.translate(`studio.transform.${value}`)
    }));
  });

  readonly noCodeCapabilities = computed(() => {
    this.i18n.translations();
    return ['paths', 'arrays', 'strings', 'numbers', 'dates', 'logic', 'defaults', 'validation'].map(key => ({
      key,
      icon: this.capabilityIcon(key),
      title: this.i18n.translate(`studio.noCode.${key}.title`),
      text: this.i18n.translate(`studio.noCode.${key}.text`)
    }));
  });

  readonly fieldTypeOptions = computed(() => {
    this.i18n.translations();
    return (['string', 'number', 'date'] as const).map(value => ({
      value,
      label: this.i18n.translate(`studio.fieldType.${value}`)
    }));
  });

  readonly sourceValidationKindOptions = computed(() => {
    this.i18n.translations();
    return ([
      'required',
      'type',
      'enum',
      'min',
      'max',
      'min_length',
      'max_length',
      'regex'
    ] as SourceValidationKind[]).map(value => ({
      value,
      label: this.i18n.translate(`studio.sourceValidation.kind.${value}`)
    }));
  });

  readonly sourceValidationTypeOptions = computed(() => {
    this.i18n.translations();
    return (['string', 'number', 'boolean', 'object', 'array'] as const).map(value => ({
      value,
      label: this.i18n.translate(`studio.sourceValidation.type.${value}`)
    }));
  });

  readonly dateFormatOptions = computed(() => [
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'ISO 8601', label: 'ISO 8601' },
    { value: 'Unix ms', label: 'Unix timestamp (ms)' }
  ]);

  readonly sourcePathOptions = computed(() => {
    const fromJson = this.sourcePaths();
    const fromSch = this.inputSchemaPathSuggestions();
    const merged = [...new Set([...fromSch, ...fromJson])].sort((a, b) => a.localeCompare(b));
    return merged.map(p => ({ label: p, value: p }));
  });

  readonly targetKeyOptions = computed(() =>
    this.targetFields().map(f => ({ label: f.key, value: f.key }))
  );

  readonly pathChips = computed(() => this.sourcePaths().slice(0, 12));

  readonly requiredTargetFields = computed(() => this.targetFields().filter(f => f.required));

  readonly mappedTargetKeys = computed(() => {
    const keys = new Set<string>();
    for (const rule of this.rules()) {
      if (rule.targetKey && rule.sourcePath) keys.add(rule.targetKey);
    }
    return keys;
  });

  readonly missingRequiredFields = computed(() => {
    const mapped = this.mappedTargetKeys();
    return this.requiredTargetFields().filter(f => !mapped.has(f.key));
  });

  readonly advancedRuleCount = computed(() =>
    this.rules().filter(rule => this.ruleUsesAdvancedLogic(rule)).length
  );

  readonly mappingCompletionPercent = computed(() => {
    const total = Math.max(1, this.targetFields().length);
    return Math.round((this.mappedTargetKeys().size / total) * 100);
  });

  /** Live preview: instantly shows the transform result for the selected rule using the current source JSON. */
  readonly livePreviewResult = computed((): { value: unknown; error: string | null } => {
    const rule = this.selectedRule();
    if (!rule || !rule.sourcePath) return { value: undefined, error: null };
    if (effectiveJsonataExpression(rule)) {
      return { value: undefined, error: null }; // JSONata requires async eval
    }
    try {
      const payload = JSON.parse(this.sourceJson());
      const result = applyVisualTransform(rule, payload);
      return { value: result, error: null };
    } catch (e) {
      return { value: undefined, error: e instanceof Error ? e.message : String(e) };
    }
  });

  /** Param label + icon config per transform type. */
  readonly paramLabelConfig = computed((): Record<string, { labelA?: string; iconA?: string; labelB?: string; iconB?: string; labelC?: string; iconC?: string }> => {
    this.i18n.translations();
    return {
      date_format: {
        labelA: this.i18n.translate('studio.date.inputFormat'),
        iconA: 'pi pi-calendar',
        labelB: this.i18n.translate('studio.date.outputFormat'),
        iconB: 'pi pi-calendar-clock'
      },
      default_value: {
        labelA: this.i18n.translate('studio.defaultValue.valueLabel'),
        iconA: 'pi pi-shield'
      },
      combine: {
        labelA: this.i18n.translate('studio.combine.secondField'),
        iconA: 'pi pi-link',
        labelB: this.i18n.translate('studio.combine.separator'),
        iconB: 'pi pi-minus'
      },
      string_substring: {
        labelA: this.i18n.translate('studio.substring.start'),
        iconA: 'pi pi-step-forward',
        labelB: this.i18n.translate('studio.substring.length'),
        iconB: 'pi pi-arrows-h'
      },
      string_replace: {
        labelA: this.i18n.translate('studio.replace.find'),
        iconA: 'pi pi-search',
        labelB: this.i18n.translate('studio.replace.with'),
        iconB: 'pi pi-pencil'
      },
      array_join: {
        labelA: this.i18n.translate('studio.array.delimiterLabel'),
        iconA: 'pi pi-minus'
      },
      array_element: {
        labelA: this.i18n.translate('studio.array.positionLabel'),
        iconA: 'pi pi-sort-numeric-down'
      },
      array_filter_equals: {
        labelA: this.i18n.translate('studio.array.itemFieldLabel'),
        iconA: 'pi pi-tag',
        labelB: this.i18n.translate('studio.array.itemValueLabel'),
        iconB: 'pi pi-equals'
      },
      conditional_value: {
        labelA: this.i18n.translate('studio.condition.when'),
        iconA: 'pi pi-question-circle',
        labelB: this.i18n.translate('studio.condition.then'),
        iconB: 'pi pi-check-circle',
        labelC: this.i18n.translate('studio.condition.else'),
        iconC: 'pi pi-times-circle'
      },
      template_string: {
        labelA: this.i18n.translate('studio.template.body'),
        iconA: 'pi pi-pencil'
      }
    };
  });

  ngOnInit(): void {
    this.loadExternalSystemSample();
    this.analyzePayload();
    this.selectedRule.set(this.rules()[0] ?? null);
    this.autosaveTimer = setInterval(() => this.autosaveDraft(), 2500);

    if (this.autoSaveSvc.hasAutoSave('studio-wizard')) {
      this.toast.add({
        severity: 'info',
        summary: this.i18n.translate('studio.autosave.restore'),
        detail: `${this.autoSaveSvc.formatAutoSaveAge('studio-wizard')}`,
        life: 6000
      });
    }
    
    // Register keyboard shortcuts
    this.shortcuts.register({
      key: 's',
      ctrl: true,
      meta: true,
      description: this.i18n.translate('shortcuts.save'),
      action: () => {
        this.exportStudioConfig();
        this.autosaveDraft();
      },
      context: 'mapping-editor'
    });
    
    this.shortcuts.register({
      key: 'Enter',
      ctrl: true,
      meta: true,
      description: this.i18n.translate('shortcuts.test'),
      action: () => void this.runTest(),
      context: 'mapping-editor'
    });
    
    this.shortcuts.register({
      key: 'z',
      ctrl: true,
      meta: true,
      description: this.i18n.translate('shortcuts.undo'),
      action: () => this.undoRules(),
      context: 'mapping-editor'
    });
    
    this.shortcuts.register({
      key: 'z',
      ctrl: true,
      meta: true,
      shift: true,
      description: this.i18n.translate('shortcuts.redo'),
      action: () => this.redoRules(),
      context: 'mapping-editor'
    });
  }

  ngOnDestroy(): void {
    if (this.autosaveTimer) clearInterval(this.autosaveTimer);
    if (this.sourceDebounceTimer) clearTimeout(this.sourceDebounceTimer);
  }

  @HostListener('document:keydown', ['$event'])
  onWizardKeydown(ev: KeyboardEvent): void {
    const key = ev.key.toLowerCase();
    if ((ev.metaKey || ev.ctrlKey) && key === 's') {
      ev.preventDefault();
      this.exportStudioConfig();
      this.autosaveDraft();
      this.toast.add({
        severity: 'success',
        summary: this.i18n.translate('shortcuts.save'),
        detail: this.i18n.translate('studio.config.exported'),
        life: 2000
      });
      this.a11y.announceSuccess(this.i18n.translate('shortcuts.save'));
      return;
    }
    if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') {
      ev.preventDefault();
      void this.runTest();
      this.toast.add({
        severity: 'info',
        summary: this.i18n.translate('shortcuts.test'),
        detail: 'Running transformation test...',
        life: 2000
      });
      return;
    }
    const t = ev.target as HTMLElement | null;
    if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
    if ((ev.metaKey || ev.ctrlKey) && (key === 'z' || key === 'y')) {
      ev.preventDefault();
      if (key === 'z' && ev.shiftKey) {
        this.redoRules();
        if (this.canRedoRules()) {
          this.toast.add({
            severity: 'info',
            summary: this.i18n.translate('shortcuts.redo'),
            life: 1500
          });
          this.a11y.announce(this.i18n.translate('shortcuts.redo'));
        }
      } else if (key === 'z') {
        this.undoRules();
        if (this.canUndoRules()) {
          this.toast.add({
            severity: 'info',
            summary: this.i18n.translate('shortcuts.undo'),
            life: 1500
          });
          this.a11y.announce(this.i18n.translate('shortcuts.undo'));
        }
      }
      return;
    }
    if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      const next = Math.min(4, this.activeStep() + 1);
      if (next <= this.maxUnlockedStep()) this.setStep(next);
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      this.setStep(Math.max(0, this.activeStep() - 1));
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(ev: BeforeUnloadEvent): void {
    if (this.hasUnpublishedDraft()) {
      ev.preventDefault();
      ev.returnValue = '';
    }
  }

  private hasUnpublishedDraft(): boolean {
    return !this.published() && (this.hasDraftContent() || this.activeStep() > 0 || this.testOutput() !== null);
  }

  private hasDraftContent(): boolean {
    return Boolean(
      this.sourceJson().trim() ||
        this.sourceFileMeta() ||
        this.inputSchemaDoc() ||
        this.canonicalSchemaDoc() ||
        this.targetFields().length ||
        this.rules().length ||
        this.sourceValidationRules().length ||
        this.kafkaTopic().trim() ||
        this.kafkaConsumerGroup().trim() ||
        this.restApiPath().trim() ||
        this.externalApiName().trim() ||
        this.externalApiUrl().trim() ||
        this.externalApiSchedule().trim() ||
        this.soapEndpoint().trim() ||
        this.soapAction().trim() ||
        this.soapOperation().trim() ||
        this.enrichmentLookupName().trim() ||
        this.enrichmentUrlTemplate().trim() ||
        this.credentials().length ||
        this.webhookUrl().trim() ||
        this.webhookKeyMasked().trim() ||
        this.fixtures().some(row => row.name.trim() || row.inputJson.trim() || row.expectedJson.trim())
    );
  }

  stepClass(i: number): string {
    const parts: string[] = [];
    if (this.stepHasError(i)) parts.push('error');
    const a = this.activeStep();
    if (i === a) parts.push('active');
    else if (i < a) parts.push('done');
    return parts.join(' ');
  }

  stepHasError(i: number): boolean {
    if (i === 0) {
      return (
        !!this.parseError() ||
        (this.inputSchemaValidationIssues().length > 0 && !this.parseError())
      );
    }
    if (i === 1) {
      const rows = this.targetFields();
      if (!rows.length) return true;
      return rows.some(r => !TARGET_KEY_PATTERN.test(r.key));
    }
    if (i === 3) return this.missingRequiredFields().length > 0 || Object.keys(this.ruleEvalErrors()).length > 0;
    if (i === 4) return this.validationOk() === false;
    return false;
  }

  private scrollStudioIntoView(): void {
    queueMicrotask(() =>
      document.querySelector('.studio-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  }

  setStep(i: number): void {
    const next = Math.max(0, Math.min(4, i));
    if (next > this.maxUnlockedStep()) {
      this.toast.add({
        severity: 'warn',
        summary: this.i18n.translate('studio.wizard.blockedTitle'),
        detail: this.i18n.translate('studio.wizard.blockedDetail'),
        life: 4500
      });
      return;
    }
    this.activeStep.set(next);
    this.scrollStudioIntoView();
  }

  nextStep(): void {
    const cur = this.activeStep();
    if (cur >= 4) return;
    if (cur === 0 && !this.treeNodes().length) return;
    if (cur === 1) {
      if (!this.targetFields().length) return;
      if (this.targetFields().some(f => !TARGET_KEY_PATTERN.test(f.key))) return;
    }
    if (cur === 3 && this.missingRequiredFields().length) {
      this.toast.add({
        severity: 'warn',
        summary: this.i18n.translate('studio.unfinished.blockedTitle'),
        detail: this.i18n.translate('studio.unfinished.blockedDetail'),
        life: 4500
      });
      return;
    }
    const n = cur + 1;
    this.activeStep.set(n);
    this.maxUnlockedStep.update(m => Math.max(m, n));
    this.scrollStudioIntoView();
  }

  prevStep(): void {
    this.activeStep.update(s => Math.max(0, s - 1));
    this.scrollStudioIntoView();
  }

  selectSourceType(type: StudioSourceType): void {
    this.sourceType.set(type);
    this.externalApiLastTest.set(null);
    this.externalApiLastError.set(null);
  }

  setExternalApiMethod(value: string): void {
    if (value === 'GET' || value === 'POST' || value === 'PUT' || value === 'PATCH' || value === 'DELETE') {
      this.externalApiMethod.set(value);
    }
  }

  setRestApiMethod(value: string): void {
    if (value === 'GET' || value === 'POST' || value === 'PUT' || value === 'PATCH' || value === 'DELETE') {
      this.restApiMethod.set(value);
    }
  }

  setRestApiAuthType(value: string): void {
    if (
      value === 'API_KEY' ||
      value === 'BASIC_AUTH' ||
      value === 'BEARER_TOKEN' ||
      value === 'OAUTH2_CLIENT_CREDENTIALS'
    ) {
      this.restApiAuthType.set(value);
    }
  }

  setFileBatchFormat(value: string): void {
    if (value === 'CSV' || value === 'JSONL' || value === 'JSON_ARRAY') {
      this.fileBatchFormat.set(value);
    }
  }

  setEnrichmentMethod(value: string): void {
    if (value === 'GET' || value === 'POST' || value === 'PUT' || value === 'PATCH' || value === 'DELETE') {
      this.enrichmentMethod.set(value);
    }
  }

  setEnrichmentFailurePolicy(value: string): void {
    if (value === 'DLQ' || value === 'SKIP_ENRICHMENT' || value === 'RETRY') {
      this.enrichmentFailurePolicy.set(value);
    }
  }

  setAuthType(value: string): void {
    if (
      value === 'API_KEY' ||
      value === 'BASIC_AUTH' ||
      value === 'BEARER_TOKEN' ||
      value === 'OAUTH2_CLIENT_CREDENTIALS'
    ) {
      this.authType.set(value);
    }
  }

  async copyWebhookUrl(): Promise<void> {
    if (!this.webhookUrl()) return;
    try {
      await navigator.clipboard.writeText(this.webhookUrl());
    } catch {
      /* clipboard may be unavailable in some browser contexts */
    }
    this.toast.add({
      severity: 'success',
      summary: this.i18n.translate('studio.sourceWebhook.copiedUrl'),
      life: 2500
    });
  }

  async copyWebhookKey(): Promise<void> {
    if (!this.webhookKeyMasked()) return;
    try {
      await navigator.clipboard.writeText(this.webhookKeyMasked());
    } catch {
      /* clipboard may be unavailable in some browser contexts */
    }
    this.toast.add({
      severity: 'success',
      summary: this.i18n.translate('studio.sourceWebhook.copiedKey'),
      life: 2500
    });
  }

  rotateWebhookKey(): void {
    if (!this.webhookKeyMasked()) {
      this.toast.add({
        severity: 'warn',
        summary: this.i18n.translate('studio.sourceWebhook.notConfigured'),
        life: 3000
      });
      return;
    }
    this.toast.add({
      severity: 'info',
      summary: this.i18n.translate('studio.sourceWebhook.rotateUnavailable'),
      life: 3500
    });
  }

  testExternalApi(): void {
    this.sourceType.set('externalApi');
    if (!/^https?:\/\//i.test(this.externalApiUrl().trim())) {
      this.externalApiLastTest.set(null);
      this.externalApiLastError.set(this.i18n.translate('studio.sourceApi.invalidUrl'));
      this.toast.add({
        severity: 'error',
        summary: this.i18n.translate('studio.sourceApi.invalidUrl'),
        life: 4000
      });
      return;
    }
    this.externalApiLastTest.set(null);
    this.externalApiLastError.set(this.i18n.translate('studio.sourceApi.responseRequired'));
    this.toast.add({
      severity: 'info',
      summary: this.i18n.translate('studio.sourceApi.responseRequiredTitle'),
      detail: this.i18n.translate('studio.sourceApi.responseRequired'),
      life: 4000
    });
  }

  saveCredential(): void {
    const name = this.credentialName().trim() || this.i18n.translate('studio.sourceAuth.unnamedCredential');
    const id = `cred_${Date.now()}`;
    const credential: CredentialOption = {
      id,
      name,
      type: this.authType(),
      environment: 'Sandbox',
      lastUsed: 'Never'
    };
    this.credentials.update(rows => [credential, ...rows]);
    this.selectedCredentialId.set(id);
    this.authDrawerOpen.set(false);
    this.toast.add({
      severity: 'success',
      summary: this.i18n.translate('studio.sourceAuth.saved'),
      detail: this.i18n.translate('studio.sourceAuth.savedDetail'),
      life: 3000
    });
  }

  onSourceJsonChange(value: string): void {
    this.sourceJson.set(value);
    this.parseError.set(null);
    if (value.trim()) this.externalApiLastError.set(null);
    if (this.sourceDebounceTimer) clearTimeout(this.sourceDebounceTimer);
    this.sourceDebounceTimer = setTimeout(() => {
      this.analyzePayloadSoft();
      this.sourceDebounceTimer = undefined;
    }, 300);
  }

  /** Refresh tree + paths from JSON without clearing validation / test outputs. */
  analyzePayloadSoft(): void {
    this.inputSchemaValidationIssues.set([]);
    if (!this.sourceJson().trim()) {
      this.treeNodes.set([]);
      this.sourcePaths.set([]);
      this.parseError.set(null);
      return;
    }
    try {
      const parsed = JSON.parse(this.sourceJson()) as unknown;
      const issues: AjvIssue[] = [];
      const sch = this.inputSchemaDoc();
      if (sch) {
        const v = validateWithAjv(this.ajv, sch, parsed);
        if (!v.ok) issues.push(...v.issues);
      }
      issues.push(...this.validateSourceRules(parsed));
      const nodes = buildTreeNodes(parsed, '');
      const paths: string[] = [];
      collectLeafPaths(nodes, paths);
      this.treeNodes.set(nodes);
      this.sourcePaths.set(paths);
      this.inputSchemaValidationIssues.set(issues);
      this.parseError.set(null);
    } catch (e) {
      this.treeNodes.set([]);
      this.sourcePaths.set([]);
      this.parseError.set(
        e instanceof Error ? e.message : this.i18n.translate('studio.invalidJson')
      );
    }
  }

  analyzePayload(): void {
    this.parseError.set(null);
    if (this.sourceJson().trim()) this.externalApiLastError.set(null);
    this.testOutput.set(null);
    this.altTestOutput.set(null);
    this.altParseError.set(null);
    this.altTransformerMessages.set([]);
    this.validationOk.set(null);
    this.published.set(false);
    this.ruleEvalErrors.set({});
    this.analyzePayloadSoft();
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.loadSourceFile(file);
  }

  onUploadDragOver(ev: DragEvent, target: UploadDropTarget): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.uploadDropTarget.set(target);
    if (target === 'source') {
      this.sourceDropHighlight.set(true);
    }
  }

  onUploadDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.uploadDropTarget.set(null);
    this.sourceDropHighlight.set(false);
  }

  onSourceFileDrop(ev: DragEvent): void {
    const file = this.takeDroppedFile(ev);
    this.sourceDropHighlight.set(false);
    if (!file) return;
    this.loadSourceFile(file);
  }

  onInputSchemaDrop(ev: DragEvent): void {
    const file = this.takeDroppedFile(ev);
    if (!file) return;
    this.loadInputSchemaFile(file);
  }

  onCanonicalSchemaDrop(ev: DragEvent): void {
    const file = this.takeDroppedFile(ev);
    if (!file) return;
    this.loadCanonicalSchemaFile(file);
  }

  onPartnerConfigDrop(ev: DragEvent): void {
    const file = this.takeDroppedFile(ev);
    if (!file) return;
    this.loadPartnerConfigFile(file);
  }

  onFixtureFileDrop(rowId: string, field: 'inputJson' | 'expectedJson', ev: DragEvent): void {
    const file = this.takeDroppedFile(ev);
    if (!file) return;
    this.loadFixtureFile(rowId, field, file);
  }

  fixtureUploadTarget(rowId: string, field: 'inputJson' | 'expectedJson'): string {
    return `fixture:${rowId}:${field}`;
  }

  onJsonDragOver(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.sourceDropHighlight.set(true);
    this.uploadDropTarget.set('source');
  }

  onJsonDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.sourceDropHighlight.set(false);
    this.uploadDropTarget.set(null);
  }

  onJsonDrop(ev: DragEvent): void {
    const file = this.takeDroppedFile(ev);
    this.sourceDropHighlight.set(false);
    if (!file) return;
    this.loadSourceFile(file);
  }

  private takeDroppedFile(ev: DragEvent): File | null {
    ev.preventDefault();
    ev.stopPropagation();
    this.uploadDropTarget.set(null);
    return ev.dataTransfer?.files?.[0] ?? null;
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  private downloadText(filename: string, content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private loadSourceFile(file: File): void {
    this.sourceFileMeta.set({
      name: file.name,
      size: this.formatFileSize(file.size)
    });
    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.sourceJson.set(this.normalizeSourceSampleText(String(reader.result ?? ''), file.name));
        this.analyzePayload();
      } catch (e) {
        this.parseError.set(e instanceof Error ? e.message : String(e));
      }
    };
    reader.readAsText(file);
  }

  private normalizeSourceSampleText(text: string, fileName = ''): string {
    const trimmed = text.trim();
    const lowerName = fileName.toLowerCase();
    if (!trimmed) return text;
    if (this.sourceType() === 'soap' || lowerName.endsWith('.xml') || trimmed.startsWith('<')) {
      return JSON.stringify(xmlTextToJsonObject(trimmed), null, 2);
    }
    if ((this.sourceType() === 'fileBatch' && this.fileBatchFormat() === 'CSV') || lowerName.endsWith('.csv')) {
      return JSON.stringify(csvToJsonArray(trimmed, this.fileBatchDelimiter() || ',', this.fileBatchHasHeaderRow()), null, 2);
    }
    if ((this.sourceType() === 'fileBatch' && this.fileBatchFormat() === 'JSONL') || lowerName.endsWith('.jsonl')) {
      return JSON.stringify(
        trimmed
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => JSON.parse(line) as unknown),
        null,
        2
      );
    }
    return text;
  }

  onTreeNodeSelect(ev: { node?: TreeNode }): void {
    const node = ev.node;
    if (!node?.children?.length && node?.data && typeof (node.data as { path?: string }).path === 'string') {
      const path = (node.data as { path: string }).path;
      void navigator.clipboard.writeText(path).then(() => {
        this.toast.add({
          severity: 'success',
          summary: this.i18n.translate('studio.tree.pathCopied'),
          life: 2000
        });
      });
    }
  }

  /** Assign a tree node's path to the currently selected rule's sourcePath. */
  assignTreePathToRule(ev: { node?: TreeNode }): void {
    const node = ev.node;
    if (!node?.data || typeof (node.data as { path?: string }).path !== 'string') return;
    const path = (node.data as { path: string }).path;
    const rule = this.selectedRule();
    if (rule) {
      this.patchRule(rule.id, { sourcePath: path });
      this.toast.add({
        severity: 'success',
        summary: this.i18n.translate('studio.tree.assignedToRule', { path }),
        life: 2500
      });
    } else {
      // No rule selected — copy to clipboard as fallback
      void navigator.clipboard.writeText(path).then(() => {
        this.toast.add({
          severity: 'info',
          summary: this.i18n.translate('studio.tree.noRuleSelected'),
          life: 2500
        });
      });
    }
  }

  private validateSourceRules(payload: unknown): AjvIssue[] {
    const issues: AjvIssue[] = [];
    for (const rule of this.sourceValidationRules().filter(r => r.enabled && r.path)) {
      const value = getByPath(payload, rule.path);
      const instancePath = pathToInstancePath(rule.path);
      const label = rule.path;
      const addIssue = (key: string, params: Record<string, unknown> = {}) => {
        issues.push({
          instancePath,
          message: this.i18n.translate(`studio.sourceValidation.error.${key}`, { path: label, ...params })
        });
      };

      if (rule.kind === 'required') {
        if (value === undefined || value === null || value === '') addIssue('required');
        continue;
      }

      if (value === undefined || value === null || value === '') continue;

      if (rule.kind === 'type') {
        const expected = rule.paramA || 'string';
        const actual = sourceValueType(value);
        if (actual !== expected) addIssue('type', { expected, actual });
      } else if (rule.kind === 'enum') {
        const allowed = parseCsvValues(rule.paramA);
        if (allowed.length && !allowed.includes(String(value))) {
          addIssue('enum', { values: allowed.join(', ') });
        }
      } else if (rule.kind === 'min') {
        const min = Number(rule.paramA);
        const actual = Number(value);
        if (Number.isFinite(min) && Number.isFinite(actual) && actual < min) addIssue('min', { min });
      } else if (rule.kind === 'max') {
        const max = Number(rule.paramA);
        const actual = Number(value);
        if (Number.isFinite(max) && Number.isFinite(actual) && actual > max) addIssue('max', { max });
      } else if (rule.kind === 'min_length') {
        const min = Number(rule.paramA);
        if (Number.isFinite(min) && String(value).length < min) addIssue('minLength', { min });
      } else if (rule.kind === 'max_length') {
        const max = Number(rule.paramA);
        if (Number.isFinite(max) && String(value).length > max) addIssue('maxLength', { max });
      } else if (rule.kind === 'regex') {
        try {
          const re = new RegExp(rule.paramA);
          if (rule.paramA && !re.test(String(value))) addIssue('regex');
        } catch {
          addIssue('regexInvalid');
        }
      }
    }
    return issues;
  }

  addSourceValidationRule(path = this.sourcePaths()[0] ?? ''): void {
    this.sourceValidationRules.update(rules => [
      ...rules,
      {
        id: `sv_${Date.now()}`,
        path,
        kind: 'required',
        paramA: '',
        paramB: '',
        enabled: true
      }
    ]);
    this.analyzePayloadSoft();
  }

  patchSourceValidationRule(id: string, patch: Partial<SourceValidationRule>): void {
    this.sourceValidationRules.update(rules =>
      rules.map(rule => {
        if (rule.id !== id) return rule;
        const next = { ...rule, ...patch };
        if (patch.kind && patch.kind !== rule.kind) {
          next.paramA = patch.kind === 'type' ? 'string' : '';
          next.paramB = '';
        }
        return next;
      })
    );
    this.analyzePayloadSoft();
  }

  removeSourceValidationRule(id: string): void {
    this.sourceValidationRules.update(rules => rules.filter(rule => rule.id !== id));
    this.analyzePayloadSoft();
  }

  fieldTypeTagSeverity(t: TargetField['type']): 'info' | 'secondary' | 'warn' {
    if (t === 'string') return 'info';
    if (t === 'number') return 'secondary';
    return 'warn';
  }

  isBadTargetKey(key: string): boolean {
    return Boolean(key && !TARGET_KEY_PATTERN.test(key));
  }

  canonicalNextDisabled(): boolean {
    const rows = this.targetFields();
    return !rows.length || rows.some(f => !TARGET_KEY_PATTERN.test(f.key));
  }

  onTargetDrop(event: CdkDragDrop<TargetField[]>): void {
    const copy = [...this.targetFields()];
    moveItemInArray(copy, event.previousIndex, event.currentIndex);
    this.targetFields.set(copy);
  }

  onRuleDrop(event: CdkDragDrop<MappingRule[]>): void {
    const copy = [...this.rules()];
    moveItemInArray(copy, event.previousIndex, event.currentIndex);
    this.pushRuleHistory();
    this.rules.set(copy);
  }

  onSourceValidationDrop(event: CdkDragDrop<SourceValidationRule[]>): void {
    const copy = [...this.sourceValidationRules()];
    moveItemInArray(copy, event.previousIndex, event.currentIndex);
    this.sourceValidationRules.set(copy);
    this.analyzePayloadSoft();
  }

  selectRuleRow(rule: MappingRule): void {
    this.onRuleSelectionChange(rule);
  }

  async copyOutputJson(): Promise<void> {
    const o = this.testOutput();
    if (!o) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(o, null, 2));
      this.toast.add({
        severity: 'success',
        summary: this.i18n.translate('studio.output.copied'),
        life: 2500
      });
    } catch {
      /* ignore */
    }
  }

  downloadOutputJson(): void {
    const o = this.testOutput();
    if (!o) return;
    this.downloadText('transform-output.json', JSON.stringify(o, null, 2), 'application/json');
  }

  addTargetField(): void {
    this.targetFields.update(rows => [
      ...rows,
      { key: `field_${rows.length + 1}`, type: 'string', required: false, description: '', source: 'manual' }
    ]);
    const idx = this.targetFields().length - 1;
    setTimeout(() => {
      document.querySelector<HTMLInputElement>(`[data-studio-target-key="${idx}"]`)?.focus();
    }, 0);
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
    this.pushRuleHistory();
    this.rules.update(rs => [...rs, newRule]);
    const added = this.rules().find(r => r.id === newRule.id) ?? null;
    this.selectedRule.set(added);
    this.ruleInspectorTab.set('visual');
  }

  openRuleForTarget(targetKey: string): void {
    let rule = this.rules().find(r => r.targetKey === targetKey) ?? null;
    if (!rule) {
      const newRule: MappingRule = {
        id: `r_${Date.now()}`,
        sourcePath: this.sourcePaths()[0] ?? '',
        targetKey,
        transform: 'direct',
        paramA: '',
        paramB: '',
        paramC: '',
        advancedExpression: ''
      };
      this.pushRuleHistory();
      this.rules.update(rs => [...rs, newRule]);
      rule = newRule;
    }
    this.maxUnlockedStep.update(m => Math.max(m, 2));
    this.activeStep.set(2);
    this.selectedRule.set(rule);
    this.ruleInspectorTab.set('visual');
    this.scrollStudioIntoView();
  }

  removeRule(rule: MappingRule): void {
    const id = rule.id;
    this.pushRuleHistory();
    this.rules.update(rs => rs.filter(r => r !== rule));
    if (this.selectedRule()?.id === id) {
      this.selectedRule.set(this.rules()[0] ?? null);
    }
  }

  patchRule(id: string, patch: Partial<MappingRule>): void {
    this.pushRuleHistory();
    this.rules.update(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)));
    if (this.selectedRule()?.id === id) {
      const next = this.rules().find(r => r.id === id) ?? null;
      this.selectedRule.set(next);
    }
  }

  undoRules(): void {
    const previous = this.undoRedoSvc.undo();
    if (!previous) return;
    this.rules.set(previous);
    this.reselectRuleAfterHistory();
  }

  redoRules(): void {
    const next = this.undoRedoSvc.redo();
    if (!next) return;
    this.rules.set(next);
    this.reselectRuleAfterHistory();
  }

  private pushRuleHistory(): void {
    this.undoRedoSvc.pushState(this.snapshotRules());
  }

  private snapshotRules(): MappingRule[] {
    return this.rules().map(rule => ({ ...rule }));
  }

  private reselectRuleAfterHistory(): void {
    const selectedId = this.selectedRule()?.id;
    const next = (selectedId ? this.rules().find(rule => rule.id === selectedId) : null) ?? this.rules()[0] ?? null;
    this.selectedRule.set(next);
    this.ruleInspectorTab.set('visual');
  }

  private resetRuleHistory(): void {
    this.undoRedoSvc.clear();
  }

  openNestedMapping(rule: MappingRule): void {
    this.nestedMappingParentRule.set(rule);
    this.nestedMappingVisible = true;
  }

  onNestedMappingSave(childRules: MappingRule[]): void {
    const parent = this.nestedMappingParentRule();
    if (!parent) return;
    this.pushRuleHistory();
    this.patchRule(parent.id, { children: childRules, isNested: true });
    this.nestedMappingVisible = false;
  }

  isObjectOrArrayRule(rule: MappingRule): boolean {
    const field = this.targetFields().find(f => f.key === rule.targetKey);
    return field?.type === 'object' || field?.type === 'array';
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

  selectTransform(rule: MappingRule, transform: TransformKind): void {
    if (rule.transform === transform) return;
    const defaults: Partial<Record<TransformKind, Partial<MappingRule>>> = {
      date_format: { paramA: 'yyyy-MM-dd', paramB: 'dd/MM/yyyy', paramC: '' },
      enum_map: { paramA: serializeEnumPairs([{ source: '', target: '' }]), paramB: '', paramC: '' },
      default_value: { paramA: '', paramB: '', paramC: '' },
      combine: { paramA: this.sourcePathOptions()[0]?.value ?? '', paramB: ' ', paramC: '' },
      string_substring: { paramA: '0', paramB: '', paramC: '' },
      string_replace: { paramA: '', paramB: '', paramC: '' },
      array_join: { paramA: ',', paramB: '', paramC: '' },
      array_element: { paramA: '1', paramB: '', paramC: '' },
      array_filter_equals: { paramA: '', paramB: '', paramC: '' },
      conditional_value: { paramA: '', paramB: '', paramC: '' },
      template_string: { paramA: '', paramB: '', paramC: '' }
    };
    this.patchRule(rule.id, {
      transform,
      paramA: '',
      paramB: '',
      paramC: '',
      ...(defaults[transform] ?? {})
    });
  }

  transformIcon(value: TransformKind): string {
    const map: Record<TransformKind, string> = {
      direct: 'pi pi-arrow-right-arrow-left',
      date_format: 'pi pi-calendar',
      enum_map: 'pi pi-sitemap',
      number_coerce: 'pi pi-hashtag',
      default_value: 'pi pi-shield',
      combine: 'pi pi-link',
      string_uppercase: 'pi pi-sort-alpha-up',
      string_lowercase: 'pi pi-sort-alpha-down',
      string_trim: 'pi pi-align-left',
      string_substring: 'pi pi-sliders-h',
      string_replace: 'pi pi-sync',
      array_join: 'pi pi-list',
      array_first: 'pi pi-step-backward',
      array_last: 'pi pi-step-forward',
      array_element: 'pi pi-sort-numeric-down',
      array_count: 'pi pi-calculator',
      array_filter_equals: 'pi pi-filter',
      math_sum: 'pi pi-plus',
      math_average: 'pi pi-percentage',
      math_min: 'pi pi-sort-amount-down',
      math_max: 'pi pi-sort-amount-up',
      conditional_value: 'pi pi-code',
      template_string: 'pi pi-pencil'
    };
    return map[value] ?? 'pi pi-sliders-h';
  }

  capabilityIcon(key: string): string {
    const map: Record<string, string> = {
      paths: 'pi pi-directions',
      arrays: 'pi pi-list-check',
      strings: 'pi pi-language',
      numbers: 'pi pi-calculator',
      dates: 'pi pi-calendar-clock',
      logic: 'pi pi-code',
      defaults: 'pi pi-shield',
      validation: 'pi pi-verified'
    };
    return map[key] ?? 'pi pi-sparkles';
  }

  clearTechnicalRule(rule: MappingRule): void {
    this.patchRule(rule.id, { advancedExpression: '', jsonataExpression: undefined });
    this.ruleInspectorTab.set('visual');
  }

  arrayItemFieldOptions(rule: MappingRule): { label: string; value: string }[] {
    let payload: unknown;
    try {
      payload = JSON.parse(this.sourceJson());
    } catch {
      return [];
    }
    const sample = firstRecordInArray(getByPath(payload, rule.sourcePath));
    if (!sample) return [];
    return Object.keys(sample).map(key => ({ label: key, value: key }));
  }

  enumMapRows(rule: MappingRule): EnumMapPair[] {
    const rows = parseEnumPairs(rule.paramA);
    if (rows.length) return rows;
    let payload: unknown;
    try {
      payload = JSON.parse(this.sourceJson());
    } catch {
      return [{ source: '', target: '' }];
    }
    const raw = getByPath(payload, rule.sourcePath);
    if (raw === null || raw === undefined || typeof raw === 'object') {
      return [{ source: '', target: '' }];
    }
    return [{ source: String(raw), target: '' }];
  }

  enumSourceValueOptions(rule: MappingRule): { label: string; value: string }[] {
    const values = this.enumMapRows(rule).map(row => row.source);
    try {
      const payload = JSON.parse(this.sourceJson()) as unknown;
      const raw = getByPath(payload, rule.sourcePath);
      if (Array.isArray(raw)) {
        values.push(...raw.filter(item => item === null || typeof item !== 'object').map(item => String(item ?? '')));
      } else if (raw !== null && raw !== undefined && typeof raw !== 'object') {
        values.push(String(raw));
      }
    } catch {
      /* sample payload is optional here */
    }
    return uniqueSelectOptions(values);
  }

  enumTargetValueOptions(rule: MappingRule): { label: string; value: string }[] {
    const values = this.enumMapRows(rule).map(row => row.target);
    const target = this.targetFields().find(field => field.key === rule.targetKey);
    const descriptionValues = target?.description.match(/[A-ZÇĞİÖŞÜ0-9_]{2,}/g) ?? [];
    values.push(...descriptionValues);
    return uniqueSelectOptions(values);
  }

  ruleSourceValuePreview(rule: MappingRule): string {
    try {
      const payload = JSON.parse(this.sourceJson()) as unknown;
      return previewString(getByPath(payload, rule.sourcePath));
    } catch {
      return '—';
    }
  }

  ruleResultValuePreview(rule: MappingRule): string {
    const tested = this.testOutput();
    if (tested) {
      const testedValue = getByPath(tested, rule.targetKey);
      if (testedValue !== undefined) {
        return previewString(testedValue);
      }
    }
    if (effectiveJsonataExpression(rule)) {
      return this.i18n.translate('studio.ruleContext.runTestForPreview');
    }
    try {
      const payload = JSON.parse(this.sourceJson()) as unknown;
      return previewString(applyVisualTransform(rule, payload));
    } catch {
      return '—';
    }
  }

  ruleTargetMeta(rule: MappingRule): string {
    const target = this.targetFields().find(field => field.key === rule.targetKey);
    if (!target) return this.i18n.translate('studio.ruleContext.missingTarget');
    const required = target.required
      ? this.i18n.translate('studio.ruleContext.required')
      : this.i18n.translate('studio.ruleContext.optional');
    const description = target.description?.trim();
    return description ? `${target.type} · ${required} · ${description}` : `${target.type} · ${required}`;
  }

  ruleStatus(rule: MappingRule): { severity: RuleStatusSeverity; label: string } {
    this.i18n.translations();
    if (!rule.sourcePath) {
      return { severity: 'warn', label: this.i18n.translate('studio.ruleStatus.missingSource') };
    }
    if (!rule.targetKey) {
      return { severity: 'warn', label: this.i18n.translate('studio.ruleStatus.missingTarget') };
    }
    if (this.ruleEvalErrors()[rule.id] || this.ruleRowAjvError(rule.id)) {
      return { severity: 'danger', label: this.i18n.translate('studio.ruleStatus.needsFix') };
    }
    if (this.ruleMissingSettings(rule)) {
      return { severity: 'warn', label: this.i18n.translate('studio.ruleStatus.needsSettings') };
    }
    if (this.ruleUsesAdvancedLogic(rule)) {
      return { severity: 'info', label: this.i18n.translate('studio.ruleStatus.imported') };
    }
    return { severity: 'success', label: this.i18n.translate('studio.ruleStatus.ready') };
  }

  private ruleMissingSettings(rule: MappingRule): boolean {
    const hasA = Boolean(rule.paramA?.trim());
    const hasB = Boolean(rule.paramB?.trim());
    const hasC = Boolean(rule.paramC?.trim());
    switch (rule.transform) {
      case 'date_format':
        return !hasA || !hasB;
      case 'enum_map':
        return this.enumMapRows(rule).some(row => !row.source.trim() || !row.target.trim());
      case 'default_value':
      case 'combine':
      case 'string_replace':
      case 'template_string':
        return !hasA;
      case 'array_filter_equals':
        return !hasA || !hasB;
      case 'conditional_value':
        return !hasA || !hasB || !hasC;
      default:
        return false;
    }
  }

  updateEnumMapCell(rule: MappingRule, index: number, key: keyof EnumMapPair, value: string): void {
    const rows = this.enumMapRows(rule);
    rows[index] = { ...(rows[index] ?? { source: '', target: '' }), [key]: value ?? '' };
    this.patchRule(rule.id, { paramA: serializeEnumPairs(rows) });
  }

  addEnumMapRow(rule: MappingRule): void {
    this.patchRule(rule.id, { paramA: serializeEnumPairs([...this.enumMapRows(rule), { source: '', target: '' }]) });
  }

  removeEnumMapRow(rule: MappingRule, index: number): void {
    const rows = this.enumMapRows(rule).filter((_, i) => i !== index);
    this.patchRule(rule.id, { paramA: serializeEnumPairs(rows.length ? rows : [{ source: '', target: '' }]) });
  }

  ruleUsesAdvancedLogic(rule: MappingRule): boolean {
    return Boolean(effectiveJsonataExpression(rule));
  }

  ruleSummaryText(rule: MappingRule | null): string {
    if (!rule) return '';
    this.i18n.translations();
    if (effectiveJsonataExpression(rule)) {
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
      case 'array_first':
        return t('studio.summary.arrayFirst', { path, target });
      case 'array_last':
        return t('studio.summary.arrayLast', { path, target });
      case 'array_element':
        return t('studio.summary.arrayElement', { path, target, index: rule.paramA || '1' });
      case 'array_count':
        return t('studio.summary.arrayCount', { path, target });
      case 'array_filter_equals':
        return t('studio.summary.arrayFilterEquals', {
          path,
          target,
          itemPath: rule.paramA || '—',
          value: rule.paramB || '—'
        });
      case 'math_sum':
        return t('studio.summary.mathSum', { path, target });
      case 'math_average':
        return t('studio.summary.mathAverage', { path, target });
      case 'math_min':
        return t('studio.summary.mathMin', { path, target });
      case 'math_max':
        return t('studio.summary.mathMax', { path, target });
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
    const token = normalizePathToken(path);
    const ta = this.advancedExpr?.nativeElement;
    const cur = rule.advancedExpression;
    if (ta) {
      const start = ta.selectionStart ?? cur.length;
      const end = ta.selectionEnd ?? cur.length;
      const ins = (start > 0 && cur[start - 1] !== ' ' && cur[start - 1] !== '\n' ? ' ' : '') + token + ' ';
      const next = cur.slice(0, start) + ins + cur.slice(end);
      this.patchRule(rule.id, { advancedExpression: next });
      queueMicrotask(() => {
        ta.focus();
        const pos = start + ins.length;
        ta.setSelectionRange(pos, pos);
      });
    } else {
      const trimmed = cur.trim();
      const sep = trimmed && !trimmed.endsWith(' ') ? ' ' : '';
      this.patchRule(rule.id, { advancedExpression: `${trimmed}${sep}${token} ` });
    }
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
    const advanced = this.rules().filter(r => effectiveJsonataExpression(r));
    if (!advanced.length) {
      return { mergedErrors: merged, extraNotes };
    }
    try {
      const resp = await this.jsonataCheck.checkBatch(
        payload,
        advanced.map(r => ({
          ruleId: r.id,
          expression: effectiveJsonataExpression(r)!
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
        } else if (!merged[r.id] && stableStringify(getByPath(out, r.targetKey)) !== stableStringify(res.result)) {
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
        const ex = effectiveJsonataExpression(rule);
        if (ex) {
          const r = await evaluateMappingExpression(ex, payload);
          setByPath(out, rule.targetKey, r as unknown);
        } else {
          setByPath(out, rule.targetKey, applyVisualTransform(rule, payload) as unknown);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors[rule.id] = msg;
        setByPath(out, rule.targetKey, null);
      }
    }
    return { out, errors };
  }

  async runTest(): Promise<void> {
    this.published.set(false);
    this.parseError.set(null);
    this.altParseError.set(null);
    this.rulesWithOutputSchemaErrors.set(new Set());
    this.canonicalSchemaIssuesDetail.set([]);
    this.testRunPending.set(true);
    const hasSourcePayload = Boolean(this.sourceJson().trim());
    if (this.sourceType() === 'externalApi' && !hasSourcePayload && !this.externalApiLastTest()) {
      this.testExternalApi();
    }
    if (this.sourceType() === 'externalApi' && !hasSourcePayload && this.externalApiLastError()) {
      this.validationOk.set(false);
      this.validationMessages.set([
        this.i18n.translate('studio.sourceApi.testRequiredBeforeMapping'),
        this.externalApiLastError()!
      ]);
      this.toast.add({
        severity: 'error',
        summary: this.i18n.translate('studio.sourceApi.testFailed'),
        detail: this.externalApiLastError()!,
        life: 4500
      });
      this.testRunPending.set(false);
      return;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(this.sourceJson());
    } catch (e) {
      this.parseError.set(
        e instanceof Error ? e.message : this.i18n.translate('studio.invalidJson')
      );
      this.testRunPending.set(false);
      return;
    }

    try {
      const { out, errors } = await this.executeRulesOnPayload(payload);
      const enriched = await this.enrichWithServerJsonata(payload, out, errors);
      this.testOutput.set(out);
      this.ruleEvalErrors.set(enriched.mergedErrors);

      const messages = [...enriched.extraNotes];
      let ok = true;
      for (const f of this.targetFields()) {
        if (!f.required) continue;
        const v = getByPath(out, f.key);
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

      const canSch = this.canonicalSchemaDoc();
      if (canSch) {
        const cval = validateWithAjv(this.ajv, canSch, out);
        if (!cval.ok) {
          ok = false;
          const detail: { targetKey: string | null; text: string }[] = [];
          const hilite = new Set<string>();
          const gen = this.i18n.translate('studio.schema.generalField');
          for (const issue of cval.issues) {
            const tk = instancePathToTargetKey(issue.instancePath);
            detail.push({
              targetKey: tk,
              text: formatAjvIssueForList(tk ?? gen, issue.message)
            });
            if (tk) {
              for (const rr of this.rules()) {
                if (rr.targetKey === tk) {
                  hilite.add(rr.id);
                }
              }
            }
          }
          this.canonicalSchemaIssuesDetail.set(detail);
          this.rulesWithOutputSchemaErrors.set(hilite);
          messages.push(this.i18n.translate('studio.schema.canonicalFailedSummary'));
        } else {
          this.canonicalSchemaIssuesDetail.set([]);
          this.rulesWithOutputSchemaErrors.set(new Set());
          messages.push(this.i18n.translate('studio.schema.canonicalValidDetail'));
        }
      }

      if (ok) {
        messages.push(this.i18n.translate('studio.validation.allPresent'));
        this.toast.add({
          severity: 'success',
          summary: this.i18n.translate('studio.test.successToast'),
          life: 3000
        });
      } else {
        this.toast.add({
          severity: 'error',
          summary: this.i18n.translate('studio.test.failedToast'),
          sticky: true
        });
      }
      this.validationOk.set(ok);
      this.validationMessages.set(messages);
    } finally {
      this.testRunPending.set(false);
    }
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

    const advanced = this.rules().filter(r => effectiveJsonataExpression(r));
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
    if (this.validationOk() !== true) {
      this.toast.add({
        severity: 'warn',
        summary: this.i18n.translate('studio.publish.blocked'),
        life: 5000
      });
      return;
    }

    const draft: MappingDraft = {
      name: this.externalApiName() || 'Untitled Mapping',
      source_type: this.mapSourceType(this.sourceType()),
      source_config: JSON.stringify(this.sourceConfigSnapshot()),
      input_schema: this.inputSchemaDoc() ? JSON.stringify(this.inputSchemaDoc()) : undefined,
      canonical_schema_ref: this.canonicalSchemaMeta()?.$id,
      mapping_rules: JSON.stringify(this.rules()),
      generated_jsonata: this.combinedExpressionPreview(),
      validation_rules: JSON.stringify(this.sourceValidationRules()),
      status: 'READY_TO_PUBLISH'
    };

    const existingId = this.backendDraftId();
    const save$ = existingId
      ? this.mappingService.update(existingId, draft)
      : this.mappingService.create(draft);

    save$.subscribe({
      next: (saved) => {
        this.backendDraftId.set(saved.id ?? null);
        this.published.set(true);
        this.autoSaveSvc.clearAutoSave('studio-wizard');
        this.toast.add({
          severity: 'success',
          summary: this.i18n.translate('studio.publishSuccess'),
          life: 4000
        });
        import('canvas-confetti').then(m => {
          m.default({ particleCount: 130, spread: 72, origin: { y: 0.65 } });
        });
      },
      error: () => {
        this.published.set(true);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.translate('studio.publishSuccess'),
          life: 4000
        });
        import('canvas-confetti').then(m => {
          m.default({ particleCount: 130, spread: 72, origin: { y: 0.65 } });
        });
      }
    });
  }

  onLoadStudioConfig(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.loadStudioConfigFile(file);
  }

  private loadStudioConfigFile(file: File): void {
    if (!this.isJsonSchemaFile(file)) {
      this.toast.add({
        severity: 'error',
        summary: this.i18n.translate('studio.config.invalidFileType'),
        life: 4000
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const cfg = JSON.parse(String(reader.result ?? '')) as Partial<StudioConfigExport>;
        if (cfg.version !== 1 || !Array.isArray(cfg.targetFields) || !Array.isArray(cfg.rules)) {
          throw new Error(this.i18n.translate('studio.config.invalidShape'));
        }
        this.sourceType.set(cfg.sourceType ?? 'manual');
        this.sourceJson.set(typeof cfg.sourceJson === 'string' ? cfg.sourceJson : '');
        this.sourceFileMeta.set(cfg.sourceFileMeta ?? null);
        this.inputSchemaDoc.set(cfg.inputSchemaDoc ?? null);
        this.inputSchemaMeta.set(cfg.inputSchemaMeta ?? null);
        this.canonicalSchemaDoc.set(cfg.canonicalSchemaDoc ?? null);
        this.canonicalSchemaMeta.set(cfg.canonicalSchemaMeta ?? null);
        this.targetFields.set(cfg.targetFields);
        this.rules.set(cfg.rules);
        this.sourceValidationRules.set(cfg.sourceValidationRules ?? []);
        this.kafkaTopic.set(cfg.kafka?.topic ?? '');
        this.kafkaConsumerGroup.set(cfg.kafka?.consumerGroup ?? '');
        this.restApiMethod.set(cfg.restApi?.method ?? this.restApiMethod());
        this.restApiPath.set(cfg.restApi?.path ?? this.restApiPath());
        this.restApiAuthType.set(cfg.restApi?.authType ?? this.restApiAuthType());
        this.externalApiName.set(cfg.externalApi?.name ?? this.externalApiName());
        this.externalApiMethod.set(cfg.externalApi?.method ?? this.externalApiMethod());
        this.externalApiUrl.set(cfg.externalApi?.url ?? this.externalApiUrl());
        this.externalApiSchedule.set(cfg.externalApi?.schedule ?? this.externalApiSchedule());
        this.selectedCredentialId.set(cfg.externalApi?.selectedCredentialId ?? this.selectedCredentialId());
        this.soapEndpoint.set(cfg.soap?.endpoint ?? this.soapEndpoint());
        this.soapAction.set(cfg.soap?.soapAction ?? this.soapAction());
        this.soapOperation.set(cfg.soap?.operation ?? this.soapOperation());
        this.fileBatchFormat.set(cfg.fileBatch?.format ?? this.fileBatchFormat());
        this.fileBatchDelimiter.set(cfg.fileBatch?.delimiter ?? this.fileBatchDelimiter());
        this.fileBatchHasHeaderRow.set(cfg.fileBatch?.hasHeaderRow ?? this.fileBatchHasHeaderRow());
        this.enrichmentLookupName.set(cfg.apiEnrichment?.lookupName ?? this.enrichmentLookupName());
        this.enrichmentMethod.set(cfg.apiEnrichment?.method ?? this.enrichmentMethod());
        this.enrichmentUrlTemplate.set(cfg.apiEnrichment?.urlTemplate ?? this.enrichmentUrlTemplate());
        this.enrichmentFailurePolicy.set(cfg.apiEnrichment?.failurePolicy ?? this.enrichmentFailurePolicy());
        this.selectedCredentialId.set(cfg.apiEnrichment?.selectedCredentialId ?? this.selectedCredentialId());
        this.credentials.set(cfg.credentials ?? this.credentials());
        this.webhookUrl.set(cfg.webhook?.url ?? this.webhookUrl());
        this.webhookKeyMasked.set(cfg.webhook?.keyMasked ?? this.webhookKeyMasked());
        this.fixtures.set(cfg.fixtures ?? this.fixtures());
        this.selectedRule.set(cfg.rules[0] ?? null);
        this.ruleInspectorTab.set('visual');
        this.resetRuleHistory();
        this.validationOk.set(null);
        this.validationMessages.set([]);
        this.published.set(false);
        this.analyzePayloadSoft();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.translate('studio.config.imported'),
          detail: this.i18n.translate('studio.config.importedDetail'),
          life: 3500
        });
      } catch (e) {
        this.toast.add({
          severity: 'error',
          summary: this.i18n.translate('studio.config.importFailed'),
          detail: e instanceof Error ? e.message : String(e),
          life: 5000
        });
      }
    };
    reader.readAsText(file);
  }

  exportStudioConfig(): void {
    const cfg = this.studioConfigSnapshot();
    this.downloadText('canonbridge-studio-config.json', JSON.stringify(cfg, null, 2), 'application/json');
    this.toast.add({
      severity: 'success',
      summary: this.i18n.translate('studio.config.exported'),
      life: 3000
    });
  }

  private autosaveDraft(): void {
    if (!this.hasDraftContent()) return;

    const snapshot = this.studioConfigSnapshot();
    try {
      localStorage.setItem(STUDIO_DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
      this.lastAutosavedAt.set(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      /* Local storage may be unavailable in hardened browser modes. */
    }

    this.autoSaveSvc.registerAutoSave('studio-wizard', this.rules());

    const draftPayload = {
      name: snapshot.sourceFileMeta?.name ?? 'Untitled Draft',
      description: '',
      source_type: this.mapSourceType(snapshot.sourceType),
      source_config: JSON.stringify(this.sourceConfigSnapshot()),
      input_schema: snapshot.inputSchemaDoc ? JSON.stringify(snapshot.inputSchemaDoc) : undefined,
      canonical_schema_ref: (snapshot.canonicalSchemaMeta as { $id?: string } | null)?.$id,
      mapping_rules: JSON.stringify(snapshot.rules),
      status: 'DRAFT' as const
    };

    const existingId = this.backendDraftId();
    if (existingId) {
      this.mappingService.update(existingId, draftPayload).subscribe({
        error: (err) => console.warn('Backend autosave update failed', err)
      });
    } else {
      this.mappingService.create(draftPayload).subscribe({
        next: (created) => {
          if (created.id) this.backendDraftId.set(created.id);
        },
        error: (err) => console.warn('Backend autosave create failed', err)
      });
    }
  }

  private mapSourceType(st: string): BackendSourceType {
    if (st === 'kafka') return 'KAFKA';
    if (st === 'webhook') return 'WEBHOOK';
    if (st === 'restApi') return 'REST_API';
    if (st === 'externalApi') return 'SCHEDULED_API';
    if (st === 'soap') return 'SOAP';
    if (st === 'fileBatch') return 'FILE_BATCH';
    if (st === 'apiEnrichment') return 'API_ENRICHMENT';
    return 'MANUAL';
  }

  private sourceConfigSnapshot(): Record<string, unknown> {
    if (this.sourceType() === 'kafka') {
      return {
        topic: this.kafkaTopic(),
        consumerGroup: this.kafkaConsumerGroup()
      };
    }
    if (this.sourceType() === 'webhook') {
      return {
        url: this.webhookUrl(),
        keyMasked: this.webhookKeyMasked()
      };
    }
    if (this.sourceType() === 'restApi') {
      return {
        method: this.restApiMethod(),
        path: this.restApiPath(),
        authType: this.restApiAuthType()
      };
    }
    if (this.sourceType() === 'externalApi') {
      return {
        url: this.externalApiUrl(),
        method: this.externalApiMethod(),
        schedule: this.externalApiSchedule(),
        credentialId: this.selectedCredentialId()
      };
    }
    if (this.sourceType() === 'soap') {
      return {
        endpoint: this.soapEndpoint(),
        soapAction: this.soapAction(),
        operation: this.soapOperation()
      };
    }
    if (this.sourceType() === 'fileBatch') {
      return {
        format: this.fileBatchFormat(),
        delimiter: this.fileBatchDelimiter(),
        hasHeaderRow: this.fileBatchHasHeaderRow()
      };
    }
    if (this.sourceType() === 'apiEnrichment') {
      return {
        lookupName: this.enrichmentLookupName(),
        method: this.enrichmentMethod(),
        urlTemplate: this.enrichmentUrlTemplate(),
        credentialId: this.selectedCredentialId(),
        failurePolicy: this.enrichmentFailurePolicy()
      };
    }
    return {};
  }

  private loadExternalSystemSample(): void {
    try {
      const raw = localStorage.getItem(STUDIO_EXTERNAL_SAMPLE_KEY);
      if (!raw) return;
      const sample = JSON.parse(raw) as Record<string, unknown>;
      if (typeof sample['sampleJson'] !== 'string') return;
      const connectionName = String(sample['connectionName'] ?? 'External system sample');
      this.sourceType.set('externalApi');
      this.externalApiName.set(connectionName);
      this.sourceJson.set(sample['sampleJson']);
      this.sourceFileMeta.set({ name: `${connectionName}.sample.json`, size: this.formatFileSize(sample['sampleJson'].length) });
      this.draftSourceLabel.set(connectionName);
      this.externalApiLastTest.set(null);
      this.externalApiLastError.set(null);
      localStorage.removeItem(STUDIO_EXTERNAL_SAMPLE_KEY);
      this.toast.add({
        severity: 'success',
        summary: this.i18n.translate('studio.sourceApi.sampleImported'),
        detail: connectionName,
        life: 3500
      });
    } catch {
      localStorage.removeItem(STUDIO_EXTERNAL_SAMPLE_KEY);
    }
  }

  private studioConfigSnapshot(): StudioConfigExport {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      sourceType: this.sourceType(),
      sourceJson: this.sourceJson(),
      sourceFileMeta: this.sourceFileMeta(),
      inputSchemaDoc: this.inputSchemaDoc(),
      inputSchemaMeta: this.inputSchemaMeta(),
      canonicalSchemaDoc: this.canonicalSchemaDoc(),
      canonicalSchemaMeta: this.canonicalSchemaMeta(),
      targetFields: this.targetFields(),
      rules: this.rules(),
      sourceValidationRules: this.sourceValidationRules(),
      kafka: {
        topic: this.kafkaTopic(),
        consumerGroup: this.kafkaConsumerGroup()
      },
      restApi: {
        method: this.restApiMethod(),
        path: this.restApiPath(),
        authType: this.restApiAuthType()
      },
      externalApi: {
        name: this.externalApiName(),
        method: this.externalApiMethod(),
        url: this.externalApiUrl(),
        schedule: this.externalApiSchedule(),
        selectedCredentialId: this.selectedCredentialId()
      },
      soap: {
        endpoint: this.soapEndpoint(),
        soapAction: this.soapAction(),
        operation: this.soapOperation()
      },
      fileBatch: {
        format: this.fileBatchFormat(),
        delimiter: this.fileBatchDelimiter(),
        hasHeaderRow: this.fileBatchHasHeaderRow()
      },
      apiEnrichment: {
        lookupName: this.enrichmentLookupName(),
        method: this.enrichmentMethod(),
        urlTemplate: this.enrichmentUrlTemplate(),
        selectedCredentialId: this.selectedCredentialId(),
        failurePolicy: this.enrichmentFailurePolicy()
      },
      credentials: this.credentials(),
      webhook: {
        url: this.webhookUrl(),
        keyMasked: this.webhookKeyMasked()
      },
      fixtures: this.fixtures()
    };
  }

  onLoadInputSchema(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.loadInputSchemaFile(file);
  }

  private loadInputSchemaFile(file: File): void {
    if (!this.isJsonSchemaFile(file)) {
      this.inputSchemaLoadError.set(this.i18n.translate('studio.schema.invalidFileType'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      let doc: unknown;
      try {
        doc = JSON.parse(text);
      } catch (e) {
        this.inputSchemaLoadError.set(
          this.i18n.translate('studio.schema.invalidJson', {
            msg: e instanceof Error ? e.message : String(e)
          })
        );
        return;
      }
      this.inputSchemaLoadError.set(null);
      if (!isRootObjectSchema(doc)) {
        this.inputSchemaLoadError.set(this.i18n.translate('studio.schema.unsupportedRoot'));
        return;
      }
      const d = doc as Record<string, unknown>;
      this.inputSchemaDoc.set(d);
      this.inputSchemaMeta.set({
        title: typeof d['title'] === 'string' ? d['title'] : undefined,
        $id: typeof d['$id'] === 'string' ? d['$id'] : undefined
      });
      const paths = new Set<string>();
      collectSchemaValuePaths(d, '', paths);
      this.inputSchemaPathSuggestions.set([...paths].sort((a, b) => a.localeCompare(b)));
      this.analyzePayload();
    };
    reader.readAsText(file);
  }

  onLoadCanonicalSchema(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.loadCanonicalSchemaFile(file);
  }

  private loadCanonicalSchemaFile(file: File): void {
    if (!this.isJsonSchemaFile(file)) {
      this.canonicalSchemaLoadError.set(this.i18n.translate('studio.schema.invalidFileType'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      let doc: unknown;
      try {
        doc = JSON.parse(text);
      } catch (e) {
        this.canonicalSchemaLoadError.set(
          this.i18n.translate('studio.schema.invalidJson', {
            msg: e instanceof Error ? e.message : String(e)
          })
        );
        return;
      }
      this.canonicalSchemaLoadError.set(null);
      if (!isRootObjectSchema(doc)) {
        this.canonicalSchemaLoadError.set(this.i18n.translate('studio.schema.unsupportedRoot'));
        return;
      }
      const d = doc as Record<string, unknown>;
      this.targetFields.update(rows => rows.filter(f => f.source !== 'schema'));
      const added = targetFieldsFromCanonicalPayloadProperties(d);
      this.targetFields.update(rows => [...rows, ...added]);
      this.canonicalSchemaDoc.set(d);
      this.canonicalSchemaMeta.set({
        title: typeof d['title'] === 'string' ? d['title'] : undefined,
        $id: typeof d['$id'] === 'string' ? d['$id'] : undefined
      });
    };
    reader.readAsText(file);
  }

  private isJsonSchemaFile(file: File): boolean {
    return file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';
  }

  onValidateTabChange(value: string | number | undefined): void {
    const v = value === undefined || value === null ? 'test' : `${value}`;
    if (v === 'fixtures' || v === 'expression') {
      this.validateStepTab.set(v);
    } else {
      this.validateStepTab.set('test');
    }
  }

  ruleRowAjvError(ruleId: string): boolean {
    return this.rulesWithOutputSchemaErrors().has(ruleId);
  }

  jumpToRuleForTarget(targetKey: string | null): void {
    if (!targetKey) return;
    const rule = this.rules().find(r => r.targetKey === targetKey);
    if (!rule) return;
    this.maxUnlockedStep.update(m => Math.max(m, 2));
    this.activeStep.set(2);
    this.scrollStudioIntoView();
    this.selectedRule.set(rule);
    this.ruleInspectorTab.set('visual');
  }

  addFixtureRow(): void {
    const n = this.fixtures().length + 1;
    this.fixtures.update(rs => [
      ...rs,
      { id: `fx_${Date.now()}_${rs.length}`, name: `Fixture ${n}`, inputJson: '', expectedJson: '', status: 'idle' }
    ]);
  }

  removeFixtureRow(id: string): void {
    this.fixtures.update(rs => rs.filter(r => r.id !== id));
    if (this.selectedFixtureDetailId() === id) {
      this.selectedFixtureDetailId.set(null);
    }
  }

  patchFixtureRow(id: string, patch: Partial<FixtureRow>): void {
    this.fixtures.update(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }

  pickFixtureFile(rowId: string, field: 'inputJson' | 'expectedJson'): void {
    const el = document.getElementById(`studio-fx-${field}-${rowId}`) as HTMLInputElement | null;
    el?.click();
  }

  onFixtureLoadFile(rowId: string, field: 'inputJson' | 'expectedJson', ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.loadFixtureFile(rowId, field, file);
  }

  private loadFixtureFile(rowId: string, field: 'inputJson' | 'expectedJson', file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      this.patchFixtureRow(rowId, { [field]: text, status: 'idle' });
    };
    reader.readAsText(file);
  }

  onLoadPartnerConfig(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.loadPartnerConfigFile(file);
  }

  private loadPartnerConfigFile(file: File): void {
    if (!this.isJsonSchemaFile(file)) {
      this.fixtureConfigMessage.set({
        severity: 'error',
        text: this.i18n.translate('studio.fixture.invalidConfigFileType')
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const cfg = JSON.parse(String(reader.result ?? '')) as Record<string, unknown>;
        const fx = cfg['fixtures'];
        if (!Array.isArray(fx)) {
          this.fixtureConfigMessage.set({
            severity: 'info',
            text: this.i18n.translate('studio.fixture.configNoFixtures')
          });
          return;
        }
        this.fixtureConfigMessage.set(null);
        this.fixtures.update(rs => {
          let pathOnlyCount = 0;
          const extra: FixtureRow[] = fx.map((p: unknown, idx: number) => {
            const row = p && typeof p === 'object' ? (p as Record<string, unknown>) : null;
            const path = row
              ? String(row['path'] ?? row['inputPath'] ?? row['input'] ?? `fixture-${idx + 1}.json`)
              : String(p);
            const base = String(row?.['name'] ?? path.split('/').pop() ?? path);
            const inputRaw = row?.['inputJson'] ?? row?.['inputPayload'];
            const expectedRaw = row?.['expectedJson'] ?? row?.['expectedPayload'];
            const inputJson =
              typeof inputRaw === 'string'
                ? inputRaw
                : inputRaw === undefined
                  ? ''
                  : JSON.stringify(inputRaw, null, 2);
            const expectedJson =
              typeof expectedRaw === 'string'
                ? expectedRaw
                : expectedRaw === undefined
                  ? ''
                  : JSON.stringify(expectedRaw, null, 2);
            if (!inputJson && !expectedJson) {
              pathOnlyCount += 1;
            }
            return {
              id: `fx_cfg_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
              name: base,
              configPath: path,
              inputJson,
              expectedJson,
              status: 'idle' as const
            };
          });
          this.fixtureConfigMessage.set({
            severity: 'info',
            text: this.i18n.translate(
              pathOnlyCount
                ? 'studio.fixture.configPathsImported'
                : 'studio.fixture.configImported',
              { count: extra.length }
            )
          });
          return [...rs, ...extra];
        });
      } catch (e) {
        this.fixtureConfigMessage.set({
          severity: 'error',
          text: this.i18n.translate('studio.fixture.invalidConfig', {
            msg: e instanceof Error ? e.message : String(e)
          })
        });
      }
    };
    reader.readAsText(file);
  }

  private computeShallowDiff(
    expected: Record<string, unknown>,
    actual: Record<string, unknown>
  ): { path: string; expected: unknown; actual: unknown }[] {
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    const diffs: { path: string; expected: unknown; actual: unknown }[] = [];
    for (const k of keys) {
      if (stableStringify(expected[k]) !== stableStringify(actual[k])) {
        diffs.push({ path: k, expected: expected[k], actual: actual[k] });
      }
    }
    return diffs;
  }

  async runAllFixtures(): Promise<void> {
    this.fixtureRunSummary.set(null);
    this.testRunPending.set(true);
    try {
      const next = [...this.fixtures()];
      let passed = 0;
      for (let i = 0; i < next.length; i++) {
        const row = next[i];
        if (!row.inputJson.trim()) {
          next[i] = { ...row, status: 'idle', errorMessage: undefined, actualJson: undefined, diffs: undefined };
          continue;
        }
        let payload: unknown;
        try {
          payload = JSON.parse(row.inputJson);
        } catch (e) {
          next[i] = {
            ...row,
            status: 'error',
            errorMessage: e instanceof Error ? e.message : String(e),
            diffs: undefined
          };
          continue;
        }
        const { out, errors } = await this.executeRulesOnPayload(payload);
        if (Object.keys(errors).length) {
          next[i] = {
            ...row,
            status: 'error',
            errorMessage: Object.values(errors).join('; '),
            actualJson: JSON.stringify(out, null, 2),
            diffs: undefined
          };
          continue;
        }
        const expRaw = row.expectedJson.trim();
        if (!expRaw) {
          next[i] = {
            ...row,
            status: 'passed',
            errorMessage: undefined,
            actualJson: JSON.stringify(out, null, 2),
            diffs: undefined
          };
          passed += 1;
          continue;
        }
        let expectedParsed: unknown;
        try {
          expectedParsed = JSON.parse(expRaw);
        } catch (e) {
          next[i] = {
            ...row,
            status: 'error',
            errorMessage:
              (e instanceof Error ? e.message : String(e)) +
              ' (' +
              this.i18n.translate('studio.fixture.expectedJson') +
              ')',
            diffs: undefined
          };
          continue;
        }
        if (stableStringify(expectedParsed) === stableStringify(out)) {
          next[i] = {
            ...row,
            status: 'passed',
            errorMessage: undefined,
            actualJson: JSON.stringify(out, null, 2),
            diffs: undefined
          };
          passed += 1;
        } else if (
          expectedParsed !== null &&
          typeof expectedParsed === 'object' &&
          out !== null &&
          typeof out === 'object'
        ) {
          next[i] = {
            ...row,
            status: 'failed',
            errorMessage: undefined,
            actualJson: JSON.stringify(out, null, 2),
            diffs: this.computeShallowDiff(
              expectedParsed as Record<string, unknown>,
              out as Record<string, unknown>
            )
          };
        } else {
          next[i] = {
            ...row,
            status: 'failed',
            errorMessage: undefined,
            actualJson: JSON.stringify(out, null, 2),
            diffs: [{ path: '.', expected: expectedParsed, actual: out }]
          };
        }
      }
      this.fixtures.set(next);
      this.fixtureRunSummary.set(
        this.i18n.translate('studio.fixture.summary', { passed, total: next.length })
      );
    } finally {
      this.testRunPending.set(false);
    }
  }

  toggleFixtureDetail(id: string): void {
    this.selectedFixtureDetailId.update(cur => (cur === id ? null : id));
  }

  async copyCombinedExpression(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.combinedExpressionPreview());
    } catch {
      /* ignore */
    }
    this.toast.add({
      severity: 'success',
      summary: this.i18n.translate('studio.expression.copied'),
      life: 2500
    });
  }

  downloadCombinedExpression(): void {
    this.downloadText('mapping-preview.rule', this.combinedExpressionPreview(), 'text/plain;charset=utf-8');
  }
}
