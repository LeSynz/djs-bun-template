import type {
  AnySelectMenuInteraction,
  AutocompleteInteraction,
  Awaitable,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ClientEvents,
  ContextMenuCommandInteraction,
  ModalSubmitInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

/**
 * Thrown to show the user a message. Anything else that escapes a handler is
 * logged and replaced with a generic reply, so internals never leak.
 */
export class UserError extends Error {}

interface CommandData {
  readonly name: string;
  toJSON(): RESTPostAPIApplicationCommandsJSONBody;
}

/** `src/commands/*.ts` — `export default { … } satisfies Command` */
export interface Command {
  data: CommandData;
  execute(interaction: ChatInputCommandInteraction): Awaitable<unknown>;
  autocomplete?(interaction: AutocompleteInteraction): Awaitable<unknown>;
}

/** Right-click → Apps. Lives in `src/commands/` too. */
export interface ContextCommand {
  data: CommandData;
  execute(interaction: ContextMenuCommandInteraction): Awaitable<unknown>;
}

/**
 * Handles every component whose custom id starts with `id`, up to the first
 * colon. "counter:add:5:1" → id "counter", args ["add", "5", "1"].
 *
 * The folder picks the interaction type, so `run` gets it already narrowed:
 *   src/interactions/buttons/   ButtonHandler
 *   src/interactions/modals/    ModalHandler
 *   src/interactions/selects/   SelectHandler
 */
export interface Handler<T> {
  id: string;
  run(interaction: T, args: string[]): Awaitable<unknown>;
}

export type ButtonHandler = Handler<ButtonInteraction>;
export type ModalHandler = Handler<ModalSubmitInteraction>;
export type SelectHandler = Handler<AnySelectMenuInteraction>;

/** `src/events/*.ts` */
export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  run(...args: ClientEvents[K]): Awaitable<unknown>;
}

/** The one helper: `satisfies` can't infer `run`'s arguments from `name`, this can. */
export const event = <K extends keyof ClientEvents>(e: Event<K>): Event<K> => e;
