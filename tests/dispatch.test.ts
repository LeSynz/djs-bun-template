import { afterEach, expect, mock, spyOn, test } from "bun:test";
import { MessageFlags, type Interaction } from "discord.js";
import { dispatch } from "../src/dispatch.ts";
import { UserError, type Command } from "../src/lib.ts";

function fakeInteraction(state: { deferred?: boolean; replied?: boolean } = {}) {
	return {
		commandName: "test",
		deferred: state.deferred ?? false,
		replied: state.replied ?? false,
		isChatInputCommand: () => true,
		reply: mock(async (_: unknown) => {}),
		editReply: mock(async (_: unknown) => {}),
		followUp: mock(async (_: unknown) => {}),
	};
}

function command(execute: Command["execute"]): Command {
	return { data: { name: "test", toJSON: () => ({}) as never }, execute };
}

const run = (commands: Command[], interaction: ReturnType<typeof fakeInteraction>) =>
	dispatch(new Map(commands.map((c) => [c.data.name, c])), interaction as unknown as Interaction);

const errorSpy = spyOn(console, "error").mockImplementation(() => {});
afterEach(() => errorSpy.mockClear());

test("runs the command", async () => {
	const execute = mock(async () => {});
	const interaction = fakeInteraction();

	await run([command(execute)], interaction);

	expect(execute).toHaveBeenCalledWith(interaction);
	expect(interaction.reply).not.toHaveBeenCalled();
});

test("ignores other interaction types", async () => {
	const execute = mock(async () => {});
	const interaction = { ...fakeInteraction(), isChatInputCommand: () => false };

	await run([command(execute)], interaction);

	expect(execute).not.toHaveBeenCalled();
});

test("replies with a UserError's message", async () => {
	const interaction = fakeInteraction();

	await run([command(() => { throw new UserError("nope"); })], interaction);

	expect(interaction.reply).toHaveBeenCalledWith({ content: "nope", flags: MessageFlags.Ephemeral });
	expect(errorSpy).not.toHaveBeenCalled();
});

test("logs other errors but doesn't show them", async () => {
	const interaction = fakeInteraction();

	await run([command(() => { throw new Error("secret"); })], interaction);

	expect(errorSpy).toHaveBeenCalledTimes(1);
	const [{ content }] = interaction.reply.mock.calls[0] as [{ content: string }];
	expect(content).not.toContain("secret");
});

test("replies when the command doesn't exist", async () => {
	const interaction = fakeInteraction();

	await run([], interaction);

	const [{ content }] = interaction.reply.mock.calls[0] as [{ content: string }];
	expect(content).toContain("no longer exists");
});

test("edits the reply if deferred", async () => {
	const interaction = fakeInteraction({ deferred: true });

	await run([command(() => { throw new UserError("late"); })], interaction);

	expect(interaction.editReply).toHaveBeenCalledWith({ content: "late" });
	expect(interaction.reply).not.toHaveBeenCalled();
});

test("follows up if already replied", async () => {
	const interaction = fakeInteraction({ replied: true });

	await run([command(() => { throw new UserError("again"); })], interaction);

	expect(interaction.followUp).toHaveBeenCalledWith({ content: "again", flags: MessageFlags.Ephemeral });
});
