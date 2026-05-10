import type { MappingRule } from './integration-studio.models';

function jqPath(path: string): string {
  return path.replace(/\[(\d+)\]/g, '.$1').trim();
}

function escapeSingleQuoted(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseEnumMap(s: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const part of s.split(/[,;]/).map(x => x.trim()).filter(Boolean)) {
    const eq = part.indexOf('=');
    if (eq > 0) m[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return m;
}

/** Build JSONata sub-expression for one rule (visual or explicit JSONata). */
export function ruleToJsonataFragment(rule: MappingRule): string {
  const explicit = rule.jsonataExpression?.trim() || rule.advancedExpression?.trim();
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
      const start = Math.max(0, parseInt(rule.paramA, 10) || 0);
      const len = parseInt(rule.paramB, 10);
      if (Number.isNaN(len)) {
        return `$substring($string(${base}), ${start})`;
      }
      return `$substring($string(${base}), ${start}, ${len})`;
    }
    case 'string_replace': {
      const find = escapeSingleQuoted(rule.paramA);
      const rep = escapeSingleQuoted(rule.paramB);
      return `$replace($string(${base}), '${find}', '${rep}')`;
    }
    case 'array_join': {
      const d = escapeSingleQuoted(rule.paramA || ',');
      return `$join(${base}, '${d}')`;
    }
    case 'array_element': {
      const i = parseInt(rule.paramA, 10) || 0;
      return `${base}[${i}]`;
    }
    case 'default_value': {
      const fb = escapeSingleQuoted(rule.paramA);
      return `$exists(${base}) and ${base} != null and $string(${base}) != '' ? ${base} : '${fb}'`;
    }
    case 'combine': {
      const p2 = jqPath(rule.paramA);
      const sep = escapeSingleQuoted(rule.paramB || ' ');
      const b = p2 || '$';
      return `$join([${base}, ${b}][$boolean($) and $string($) != ''], '${sep}')`;
    }
    case 'enum_map': {
      const map = parseEnumMap(rule.paramA);
      const pairs = Object.entries(map)
        .map(([k, v]) => `'${escapeSingleQuoted(k)}': '${escapeSingleQuoted(v)}'`)
        .join(', ');
      return `$lookup({${pairs}}, $string(${base}))`;
    }
    case 'conditional_value': {
      const when = escapeSingleQuoted(rule.paramA);
      const thenV = escapeSingleQuoted(rule.paramB);
      const elseV = escapeSingleQuoted(rule.paramC);
      return `$string(${base}) = '${when}' ? '${thenV}' : '${elseV}'`;
    }
    case 'date_format':
      if (rule.paramA === 'yyyy-MM-dd' && rule.paramB === 'dd/MM/yyyy') {
        const parts = `$split($string(${base}), '-')`;
        return `${parts}[2] & '/' & ${parts}[1] & '/' & ${parts}[0]`;
      }
      return `$string(${base})`;
    case 'template_string': {
      const tpl = rule.paramA;
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
