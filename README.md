# discord-bun-template

A starting point for a slash command Discord bot, written in TypeScript on Bun
with discord.js. Every command is its own file in `src/commands/`, and deploying
picks them up automatically.

## Getting started

```
bun install
cp .env.example .env
```

Put your bot token and application ID from the
[Developer Portal](https://discord.com/developers/applications) in `.env`.
Invite the bot with both the `bot` and `applications.commands` scopes, or the
slash commands won't show up. Then:

```
bun run deploy
bun run dev
```

Set `DEV_GUILD_ID` while you're working on it, so deploys go to that server
straight away. Global ones can take up to an hour.

You only need to deploy again when a command's name, description or options
change, not when you edit what it does.

Other scripts: `start`, `deploy:global`, `deploy:clear` (removes every command
from wherever `deploy` would put them), `typecheck` and `test`.

## Layout

```
src/
  index.ts       starts the client and hooks up events
  dispatch.ts    runs the command and handles errors
  deploy.ts      registers commands with Discord
  config.ts      env vars
  lib.ts         Command and Event types, UserError
  load.ts        imports every file in a folder
  commands/
    utility/     ping, avatar
  events/        ready
tests/
```

Files starting with `_` are skipped by the loader, so you can keep helpers
next to the commands that use them.

## Adding a command

Make a file in `src/commands/`, in whichever category folder fits:

```ts
// src/commands/misc/roll.ts
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../lib.ts";

export default {
	data: new SlashCommandBuilder()
		.setName("roll")
		.setDescription("Roll a die.")
		.addIntegerOption((o) => o.setName("sides").setDescription("Defaults to 20")),

	async execute(interaction) {
		const sides = interaction.options.getInteger("sides") ?? 20;
		await interaction.reply(`You rolled a ${1 + Math.floor(Math.random() * sides)}`);
	},
} satisfies Command;
```

The `satisfies Command` is what gives `interaction` its type. Run
`bun run deploy` and it's there.

If a command throws a `UserError`, its message is sent back to the user. Any
other error gets logged and the user just sees a generic reply.

## Adding an event

```ts
// src/events/memberJoin.ts
import { Events } from "discord.js";
import { event } from "../lib.ts";

export default event({
	name: Events.GuildMemberAdd,
	run(member) {
		console.log(`${member.user.tag} joined`);
	},
});
```

Use `once: true` for events that should only fire once, like `ClientReady`.
This particular one needs the Server Members intent: turn it on in the
Developer Portal and add `GatewayIntentBits.GuildMembers` in `src/index.ts`,
or the bot won't log in.

## License

MIT
