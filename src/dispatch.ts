import { MessageFlags, type Interaction, type RepliableInteraction } from "discord.js";
import { UserError, type Command } from "./lib.ts";

async function reply(interaction: RepliableInteraction, content: string) {
	const payload = { content, flags: MessageFlags.Ephemeral } as const;
	try {
		if (interaction.deferred) await interaction.editReply({ content });
		else if (interaction.replied) await interaction.followUp(payload);
		else await interaction.reply(payload);
	} catch {
		// The interaction token expired, so there's nobody left to tell.
	}
}

export async function dispatch(commands: ReadonlyMap<string, Command>, interaction: Interaction) {
	if (!interaction.isChatInputCommand()) return;

	try {
		const command = commands.get(interaction.commandName);
		if (!command) throw new UserError("That command no longer exists. Try `bun run deploy`.");
		await command.execute(interaction);
	} catch (error) {
		if (error instanceof UserError) return reply(interaction, error.message);
		console.error(`/${interaction.commandName} failed:`, error);
		await reply(interaction, "Something went wrong. The error has been logged.");
	}
}
