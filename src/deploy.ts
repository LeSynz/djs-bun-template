import { DiscordAPIError, REST, Routes } from "discord.js";
import { config } from "./config.ts";
import type { Command } from "./lib.ts";
import { load } from "./load.ts";

const args = new Set(process.argv.slice(2));
const guildId = args.has("--global") ? undefined : config.devGuildId;

const commands = await load<Command>("commands");
const body = args.has("--clear") ? [] : commands.map((command) => command.data.toJSON());

const rest = new REST().setToken(config.token);
const route = guildId
	? Routes.applicationGuildCommands(config.appId, guildId)
	: Routes.applicationCommands(config.appId);

try {
	// Clear the global list too, or every command shows up twice.
	if (guildId && !args.has("--clear")) {
		await rest.put(Routes.applicationCommands(config.appId), { body: [] });
	}

	await rest.put(route, { body });
	console.log(
		`Deployed ${body.length} commands to ${guildId ? `guild ${guildId}` : "global"}` +
			(body.length ? `: ${body.map((c) => c.name).join(", ")}` : ""),
	);
} catch (error) {
	if (error instanceof DiscordAPIError) {
		console.error(`Discord rejected the deploy (${error.status}): ${error.message}`);
		if (error.status === 401) console.error("Check DISCORD_TOKEN.");
		if (error.status === 403) console.error("Check DISCORD_APP_ID and that the bot is in the guild.");
		if (error.status === 400) console.error(error.rawError);
	} else {
		console.error(error);
	}
	process.exit(1);
}
