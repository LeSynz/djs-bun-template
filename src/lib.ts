import type {
	Awaitable,
	ChatInputCommandInteraction,
	ClientEvents,
	RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

export class UserError extends Error {}

export interface Command {
	data: {
		readonly name: string;
		toJSON(): RESTPostAPIApplicationCommandsJSONBody;
	};
	execute(interaction: ChatInputCommandInteraction): Awaitable<unknown>;
}

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
	name: K;
	once?: boolean;
	run(...args: ClientEvents[K]): Awaitable<unknown>;
}

/** `satisfies` can't infer `run`'s arguments from `name`, so events go through this. */
export const event = <K extends keyof ClientEvents>(e: Event<K>): Event<K> => e;
