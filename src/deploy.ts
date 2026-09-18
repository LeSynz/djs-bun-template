/**
 * bun run deploy          → DEV_GUILD_ID if set (instant), else global
 * bun run deploy:global   → global (up to an hour to propagate)
 * bun run deploy:clear    → remove every command from that target
 */
import { DiscordAPIError, REST, Routes } from "discord.js";
import { config } from "./config.ts";
import { load } from "./load.ts";
import type { Command, ContextCommand } from "./lib.ts";

const args = new Set(process.argv.slice(2));
const guildId = args.has("--global") ? undefined : config.devGuildId;

const commands = await load<Command | ContextCommand>("commands");
const body = args.has("--clear") ? [] : commands.map((command) => command.data.toJSON());

const rest = new REST().setToken(config.token);
const route = guildId
  ? Routes.applicationGuildCommands(config.appId, guildId)
  : Routes.applicationCommands(config.appId);

try {
  // Clear the global list when deploying to a dev guild, or both answer.
  if (guildId && !args.has("--clear")) {
    await rest.put(Routes.applicationCommands(config.appId), { body: [] });
  }

  await rest.put(route, { body });
  console.log(
    `${body.length} command(s) → ${guildId ? `guild ${guildId}` : "global"}` +
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
