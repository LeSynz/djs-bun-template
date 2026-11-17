import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config.ts";
import { dispatch } from "./dispatch.ts";
import type { Command, Event } from "./lib.ts";
import { load } from "./load.ts";

const commands = new Map<string, Command>();
for (const command of await load<Command>("commands")) commands.set(command.data.name, command);
const events = await load<Event>("events");

console.log(`Loaded ${commands.size} commands and ${events.length} events`);

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
	partials: [Partials.Channel],
});

for (const entry of events) {
	const run = (...args: unknown[]) =>
		Promise.resolve(entry.run(...(args as never))).catch((error: unknown) =>
			console.error(`Event "${entry.name}" threw:`, error),
		);
	if (entry.once) client.once(entry.name, run);
	else client.on(entry.name, run);
}

client.on(Events.InteractionCreate, (interaction) => void dispatch(commands, interaction));
client.on(Events.Error, (error) => console.error("Client error:", error));

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, () => void client.destroy().then(() => process.exit(0)));
}

await client.login(config.token);
