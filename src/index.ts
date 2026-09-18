import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
  type Interaction,
  type RepliableInteraction,
} from "discord.js";
import { config } from "./config.ts";
import { load } from "./load.ts";
import {
  UserError,
  type ButtonHandler,
  type Command,
  type ContextCommand,
  type Event,
  type Handler,
  type ModalHandler,
  type SelectHandler,
} from "./lib.ts";

const commands = new Map<string, Command | ContextCommand>();
const buttons = new Map<string, ButtonHandler>();
const modals = new Map<string, ModalHandler>();
const selects = new Map<string, SelectHandler>();

for (const command of await load<Command | ContextCommand>("commands")) {
  commands.set(command.data.name, command);
}
for (const handler of await load<ButtonHandler>("interactions/buttons")) buttons.set(handler.id, handler);
for (const handler of await load<ModalHandler>("interactions/modals")) modals.set(handler.id, handler);
for (const handler of await load<SelectHandler>("interactions/selects")) selects.set(handler.id, handler);
const events = await load<Event>("events");

console.log(
  `Loaded ${commands.size} commands, ${events.length} events, ` +
    `${buttons.size} buttons / ${modals.size} modals / ${selects.size} selects`,
);

const client = new Client({
  // Enable GuildMembers / MessageContent in the Developer Portal before adding them.
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel], // needed to receive DMs
});

/** Replies ephemerally whatever state the interaction is already in. */
async function reply(interaction: RepliableInteraction, content: string) {
  const payload = { content, flags: MessageFlags.Ephemeral } as const;
  try {
    if (interaction.deferred) await interaction.editReply({ content });
    else if (interaction.replied) await interaction.followUp(payload);
    else await interaction.reply(payload);
  } catch {
    // Token expired or another reply won the race; nothing left to say.
  }
}

/** Looks a component up by the first segment of its custom id. */
function route<T extends { customId: string }>(map: Map<string, Handler<T>>, interaction: T) {
  const [id = "", ...args] = interaction.customId.split(":");
  const handler = map.get(id);
  if (!handler) throw new UserError("This component isn't wired up anymore.");
  return handler.run(interaction, args);
}

async function dispatch(interaction: Interaction) {
  if (interaction.isAutocomplete()) {
    const command = commands.get(interaction.commandName) as Command | undefined;
    try {
      await (command?.autocomplete?.(interaction) ?? interaction.respond([]));
    } catch (error) {
      console.error(`autocomplete /${interaction.commandName}:`, error);
    }
    return;
  }

  try {
    if (interaction.isCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) throw new UserError("That command no longer exists. Try `bun run deploy`.");
      await command.execute(interaction as never);
      return;
    }

    if (interaction.isButton()) return route(buttons, interaction);
    if (interaction.isAnySelectMenu()) return route(selects, interaction);
    if (interaction.isModalSubmit()) return route(modals, interaction);
  } catch (error) {
    if (error instanceof UserError) return reply(interaction, error.message);
    console.error("Interaction failed:", error);
    await reply(interaction, "Something went wrong. The error has been logged.");
  }
}

for (const entry of events) {
  const run = (...args: unknown[]) =>
    Promise.resolve(entry.run(...(args as never))).catch((error: unknown) =>
      console.error(`Event "${entry.name}" threw:`, error),
    );
  if (entry.once) client.once(entry.name, run);
  else client.on(entry.name, run);
}

client.on(Events.InteractionCreate, (interaction) => void dispatch(interaction));
client.on(Events.Error, (error) => console.error("Client error:", error));

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => void client.destroy().then(() => process.exit(0)));
}

await client.login(config.token);
