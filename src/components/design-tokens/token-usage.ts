import 'server-only';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse, type AnyNode } from 'postcss';
import ts from 'typescript';
import type { TokenUsage } from './token-types';

// Inspect actual custom-property assignments, not generated bg/text utilities.
// Keep selectors and conditional branches: component variables change by state.
export async function collectTokenUsages(): Promise<{ colors: Record<string, TokenUsage[]>; typography: Record<string, TokenUsage[]> }> {
  const colors: Record<string, TokenUsage[]> = {};
  const typography: Record<string, TokenUsage[]> = {};
  async function sourceFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const children = await Promise.all(entries.map(entry => {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (['catalog', 'design-tokens', 'docs', 'asset-bank', 'site-map'].includes(entry.name)) return [];
        return sourceFiles(file);
      }
      return /\.(css|tsx)$/.test(entry.name) ? [file] : [];
    }));
    return children.flat().sort();
  }
  function add(name: string, value: string, sourcePath: string, scope: string) {
    if (!name.startsWith('--') || name.startsWith('--color-')) return;
    const references = new Set([...value.matchAll(/var\(\s*(--(?:color|text)-[\w-]+)/g)].map(match => match[1]));
    for (const reference of references) {
      if (reference.startsWith('--text-shadow-')) continue;
      const typeReference = reference.startsWith('--text-');
      const key = typeReference ? reference.replace(/--(?:line-height|letter-spacing|font-weight)$/, '') : reference;
      const usageName = typeReference ? name.replace(/--(?:line-height|letter-spacing|font-weight)$/, '') : name;
      const ruleScope = typeReference && usageName !== name ? `${scope} → ${name}` : scope;
      const collection = (typeReference ? typography : colors)[key] ??= [];
      let usage = collection.find(item => item.name === usageName);
      if (!usage) collection.push(usage = { name: usageName, rules: [] });
      if (!usage.rules.some(rule => rule.sourcePath === sourcePath && rule.scope === ruleScope && rule.value === value)) {
        usage.rules.push({ sourcePath, scope: ruleScope, value });
      }
    }
  }
  const files = await sourceFiles(path.join(process.cwd(), 'src'));
  const sources = await Promise.all(files.map(async file => ({ file, source: await readFile(file, 'utf8') })));
  for (const { file, source } of sources) {
    const sourcePath = path.relative(process.cwd(), file);
    if (file.endsWith('.css')) {
      parse(source).walkDecls(declaration => {
        if (!declaration.prop.startsWith('--') || !declaration.value.includes('var(')) return;
        const scopes: string[] = [];
        let parent: AnyNode | undefined = declaration.parent;
        while (parent) {
          if (parent.type === 'rule') scopes.unshift(parent.selector);
          if (parent.type === 'atrule') scopes.unshift(`@${parent.name} ${parent.params}`);
          parent = parent.parent;
        }
        add(declaration.prop, declaration.value, sourcePath, scopes.join(' → '));
      });
    } else {
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function inspect(node: ts.Node) {
        if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name) && node.name.text.startsWith('--')) {
          const name = node.name.text;
          const outerConditions: string[] = [];
          for (let child: ts.Node = node; child.parent; child = child.parent) {
            const parent = child.parent;
            if (ts.isConditionalExpression(parent)) {
              if (parent.whenTrue === child) outerConditions.unshift(parent.condition.getText(tree));
              if (parent.whenFalse === child) outerConditions.unshift(`!(${parent.condition.getText(tree)})`);
            }
          }
          function values(value: ts.Node, conditions: string[]) {
            if (ts.isConditionalExpression(value)) {
              const condition = value.condition.getText(tree);
              values(value.whenTrue, [...conditions, condition]);
              values(value.whenFalse, [...conditions, `!(${condition})`]);
            } else if (ts.isStringLiteral(value)) {
              // A nested ternary can contain a stale assignment in a branch
              // excluded by its parent. Do not document that as website usage.
              if (conditions.some(condition => conditions.includes(`!(${condition})`))) return;
              add(name, value.text, sourcePath, [path.basename(file, '.tsx'), ...conditions].join(' → '));
            } else {
              ts.forEachChild(value, child => values(child, conditions));
            }
          }
          values(node.initializer, outerConditions);
        }
        ts.forEachChild(node, inspect);
      }
      inspect(tree);
    }
  }
  return { colors, typography };
}
