import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { load } from "../src/load.ts";

const fixtures = join(import.meta.dir, "fixtures/load");

test("loads files, including nested ones", async () => {
	spyOn(console, "warn").mockImplementation(() => {});

	const modules = await load<{ name: string }>(fixtures);

	expect(modules.map((m) => m.name).sort()).toEqual(["nested", "one"]);
});

test("skips files starting with _", async () => {
	spyOn(console, "warn").mockImplementation(() => {});

	const modules = await load<{ name: string }>(fixtures);

	expect(modules.some((m) => m.name === "skipped")).toBe(false);
});

test("warns if there's no default export", async () => {
	const warn = spyOn(console, "warn").mockImplementation(() => {});

	await load(fixtures);

	expect(warn).toHaveBeenCalledWith(expect.stringContaining("no-default.ts"));
});

test("returns nothing if the folder is missing", async () => {
	expect(await load(join(fixtures, "missing"))).toEqual([]);
});
