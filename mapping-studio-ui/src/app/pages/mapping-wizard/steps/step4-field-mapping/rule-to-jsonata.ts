import type { MappingRule } from './field-mapping-step.component';

type EnumMapPair = { source: string; target: string };

function jqPath(path: string): string {
  return path.replace(/\[(\d+)\]/g, '.$1').trim();
}

function escapeSingleQuoted(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function jsonataStringLiteral(s: string): string {
  return `'${escapeSingleQuoted(s)}'`;
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

function parseEnumMap(s: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const row of parseEnumPairs(s)) {
    if (row.source.trim() && row.target.trim()) m[row.source.trim()] = row.target.trim();
  }
  return m;
}

/** Build JSONata sub-expression for one rule (visual or explicit JSONata). */
export function ruleToJsonataFragment(rule: MappingRule): string {
  const explicit = rule.advancedExpression?.trim();
  if (explicit) {
    return explicit;
  }

  const p = jqPath(rule.sourcePath);
  const base = p || '$';

  switch (rule.transform) {
    case 'direct':
      return base;
    case 'number_coerce':
      return `$number(${base})`;
    case 'string_uppercase':
      return `$uppercase($string(${base}))`;
    case 'string_lowercase':
      return `$lowercase($string(${base}))`;
    case 'string_trim':
      return `$trim($string(${base}))`;
    case 'string_substring': {
      const start = Math.max(0, parseInt(rule.paramA || '0', 10) || 0);
      const len = parseInt(rule.paramB || '', 10);
      if (Number.isNaN(len)) {
        return `$substring($string(${base}), ${start})`;
      }
      return `$substring($string(${base}), ${start}, ${len})`;
    }
    case 'string_replace': {
      const find = escapeSingleQuoted(rule.paramA || '');
      const rep = escapeSingleQuoted(rule.paramB || '');
      return `$replace($string(${base}), '${find}', '${rep}')`;
    }
    case 'array_join': {
      const d = escapeSingleQuoted(rule.paramA || ',');
      return `$join(${base}, '${d}')`;
    }
    case 'array_first':
      return `${base}[0]`;
    case 'array_last':
      return `${base}[$count(${base}) - 1]`;
    case 'array_element': {
      const uiIndex = Math.max(1, parseInt(rule.paramA || '1', 10) || 1);
      return `${base}[${uiIndex - 1}]`;
    }
    case 'array_count': {
      const filterField = rule.paramA?.trim();
      const filterValue = rule.paramB?.trim();
      if (filterField && filterValue) {
        return `$count(${base}[${jqPath(filterField)} = '${escapeSingleQuoted(filterValue)}'])`;
      }
      return `$count(${base})`;
    }
    case 'array_filter_equals': {
      const field = jqPath(rule.paramA || '').replace(/^\$?\./, '');
      const value = jsonataStringLiteral(rule.paramB || '');
      if (!field) {
        return `${base}[$string($) = ${value}]`;
      }
      return `${base}[${field} = ${value}]`;
    }
    case 'default_value': {
      const fb = escapeSingleQuoted(rule.paramA || '');
      return `$exists(${base}) and ${base} != null and $string(${base}) != '' ? ${base} : '${fb}'`;
    }
    case 'math_sum': {
      const subField = rule.paramA?.trim();
      return subField ? `$sum(${base}.${jqPath(subField)})` : `$sum(${base})`;
    }
    case 'math_average': {
      const subField = rule.paramA?.trim();
      return subField ? `$average(${base}.${jqPath(subField)})` : `$average(${base})`;
    }
    case 'math_min': {
      const subField = rule.paramA?.trim();
      return subField ? `$min(${base}.${jqPath(subField)})` : `$min(${base})`;
    }
    case 'math_max': {
      const subField = rule.paramA?.trim();
      return subField ? `$max(${base}.${jqPath(subField)})` : `$max(${base})`;
    }
    case 'combine': {
      const sep = escapeSingleQuoted(rule.paramB || ' ');
      const additionalFields = (rule.paramA || '').split(',').map(f => f.trim()).filter(Boolean);
      
      // If source path has a parent (e.g., restaurant.address.district),
      // resolve relative paths from the same parent
      const sourceParent = base.includes('.') ? base.substring(0, base.lastIndexOf('.') + 1) : '';
      
      const allPaths = [base];
      for (const field of additionalFields) {
        // If field already contains the parent path or starts from root, use as-is
        if (field.includes('.') && !sourceParent) {
          allPaths.push(jqPath(field));
        } else if (field.startsWith(sourceParent) || field.includes('.')) {
          allPaths.push(jqPath(field));
        } else {
          // Relative path - prepend parent
          allPaths.push(sourceParent + jqPath(field));
        }
      }
      
      return `$join([${allPaths.join(', ')}][$boolean($) and $string($) != ''], '${sep}')`;
    }
    case 'enum_map': {
      const map = parseEnumMap(rule.paramA || '');
      const pairs = Object.entries(map)
        .map(([k, v]) => `'${escapeSingleQuoted(k)}': '${escapeSingleQuoted(v)}'`)
        .join(', ');
      return `$lookup({${pairs}}, $string(${base}))`;
    }
    case 'conditional_value': {
      const when = escapeSingleQuoted(rule.paramA || '');
      const thenV = escapeSingleQuoted(rule.paramB || '');
      const elseV = escapeSingleQuoted(rule.paramC || '');
      return `$string(${base}) = '${when}' ? '${thenV}' : '${elseV}'`;
    }
    case 'date_format': {
      const outputFormat = rule.paramB || 'dd/MM/yyyy HH:mm';
      // JSONata $fromMillis with picture format
      // Convert ISO string to millis, then format
      const formatMap: Record<string, string> = {
        'dd/MM/yyyy': '[D01]/[M01]/[Y0001]',
        'dd/MM/yyyy HH:mm': '[D01]/[M01]/[Y0001] [H01]:[m01]',
        'MM/dd/yyyy': '[M01]/[D01]/[Y0001]',
        'yyyy-MM-dd': '[Y0001]-[M01]-[D01]',
        'yyyy-MM-dd HH:mm': '[Y0001]-[M01]-[D01] [H01]:[m01]',
        'dd.MM.yyyy': '[D01].[M01].[Y0001]',
        'dd.MM.yyyy HH:mm': '[D01].[M01].[Y0001] [H01]:[m01]',
        'HH:mm': '[H01]:[m01]',
        'HH:mm:ss': '[H01]:[m01]:[s01]'
      };
      const picture = formatMap[outputFormat] || '[D01]/[M01]/[Y0001] [H01]:[m01]';
      return `$fromMillis($toMillis(${base}), '${picture}')`;
    }
    case 'template_string': {
      const tpl = rule.paramA || '';
      if (!tpl) return "''";
      const chunks: string[] = [];
      const re = /\{\{\s*([^}]+?)\s*\}\}/g;
      let idx = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(tpl)) !== null) {
        if (m.index > idx) chunks.push(`'${escapeSingleQuoted(tpl.slice(idx, m.index))}'`);
        chunks.push(`$string(${jqPath(m[1].trim())})`);
        idx = m.index + m[0].length;
      }
      if (idx < tpl.length) chunks.push(`'${escapeSingleQuoted(tpl.slice(idx))}'`);
      return chunks.join(' & ');
    }
    default:
      return base;
  }
}

/** Requirement 7: single JSONata object mapping all target keys. */
export function buildCombinedMappingExpression(rules: MappingRule[]): string {
  const lines = rules.map(r => {
    const key = JSON.stringify(r.targetKey);
    const frag = ruleToJsonataFragment(r);
    return `  ${key}: (${frag})`;
  });
  return `{\n${lines.join(',\n')}\n}`;
}
