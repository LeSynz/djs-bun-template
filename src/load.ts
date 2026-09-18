import { Glob } from "bun";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Imports the default export of every `.ts` file under `src/<dir>`.
 * Files starting with `_` are skipped, for helpers that live beside modules.
 */
export async function load<T>(dir: string): Promise<T[]> {
  const root = join(import.meta.dir, dir);
  if (!existsSync(root)) return [];

  const modules: T[] = [];
  for await (const file of new Glob("**/*.ts").scan({ cwd: root, absolute: true })) {
    if (file.split("/").at(-1)?.startsWith("_")) continue;

    const mod = ((await import(file)) as { default?: T }).default;
    if (!mod) {
      console.warn(`[load] ${dir}/${file.slice(root.length + 1)} has no default export — skipped`);
      continue;
    }
    modules.push(mod);
  }
  return modules;
}
