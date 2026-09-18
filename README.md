# Discord Bot Template

A small [discord.js](https://discord.js.org) v14 bot on [Bun](https://bun.sh) + TypeScript.
Drop a file in a folder, default-export an object, and it's live.

## Setup

1. Create an app at [discord.com/developers/applications](https://discord.com/developers/applications).
   Copy the token from **Bot**, and the Application ID from **General Information**.
2. Invite it via **OAuth2 → URL Generator**, ticking both `bot` and `applications.commands`.
   With only `bot`, slash commands never appear.

```bash
bun install
cp .env.example .env      # DISCORD_TOKEN, DISCORD_APP_ID, DEV_GUILD_ID
bun run deploy            # register commands with Discord
bun run dev               # start, restarting on save
```

| Script | |
| --- | --- |
| `bun run dev` | Run with `--watch` |
| `bun run deploy` | Register commands — to `DEV_GUILD_ID` if set (instant), else global |
| `bun run deploy:global` | Force global (up to an hour to propagate) |
| `bun run deploy:clear` | Remove every command |
| `bun run typecheck` | `tsc --noEmit` |

**Deploying and running are separate.** Discord stores command *definitions*;
your code handles invocations. Re-run `deploy` only when a name, description or
option changes — never for handler edits, buttons, modals or events.

With `DEV_GUILD_ID` set, `deploy` also clears your global commands so dev and
prod don't both answer. Use a separate application for development.

## Layout

```
src/
  index.ts        client, loading, dispatch
  load.ts         imports the default export of every file in a folder
  lib.ts          the types your modules import
  config.ts       env
  deploy.ts       command registration
  commands/       slash and context-menu commands
  events/         gateway events
  interactions/
    buttons/      ButtonHandler
    modals/       ModalHandler
    selects/      SelectHandler
```

The folder decides what a file is. Files starting with `_` are skipped, for
helpers that live beside the modules using them — a shared database wrapper,
say, or a builder two commands both need.

## Commands

```ts
// src/commands/roll.ts
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../lib.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a die.")
    .addIntegerOption((o) => o.setName("sides").setDescription("Default 20")),

  async execute(interaction) {
    const sides = interaction.options.getInteger("sides") ?? 20;
    await interaction.reply(`🎲 ${1 + Math.floor(Math.random() * sides)}`);
  },
} satisfies Command;
```

`satisfies Command` is what types `interaction` — without it you get `any`.
Then `bun run deploy`.

- **Context menus** (right-click → Apps) use `satisfies ContextCommand` — see
  `commands/viewAvatar.ts`.
- **Permissions**: `.setDefaultMemberPermissions()` on the builder hides the
  command; check `interaction.memberPermissions` in the handler to enforce it.
- **Subcommands** are a `switch`, after `.addSubcommand()` on the builder:

  ```ts
  switch (interaction.options.getSubcommand()) {
    case "get": return interaction.reply("…");
    default:    return interaction.reply("…");
  }
  ```

- **Autocomplete** is an optional second method on the same object. Add
  `.setAutocomplete(true)` to the option, then:

  ```ts
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    await interaction.respond(
      NAMES.filter((n) => n.includes(focused))
        .slice(0, 25)                       // Discord's limit
        .map((n) => ({ name: n, value: n })),
    );
  }
  ```

## Events

```ts
// src/events/memberJoin.ts
import { Events } from "discord.js";
import { event } from "../lib.ts";

export default event({
  name: Events.GuildMemberAdd,
  run(member) {                     // typed from `name`
    console.log(`${member.user.tag} joined`);
  },
});
```

`event()` is the one helper in the template — `satisfies` can't infer `run`'s
arguments from `name`, an identity function can. Set `once: true` for one-shot
events like `ClientReady`.

This one needs the privileged **GuildMembers** intent: enable it in the
Developer Portal *and* add it in `src/index.ts`, in that order, or login fails.

## Interactions

Components live in a folder named for their type, and the folder is what types
the handler — a file in `buttons/` gets a `ButtonInteraction` directly, with no
`isButton()` narrowing.

A handler claims every custom id starting with its `id`, up to the first `:`.
The rest of the segments arrive as `args`.

```ts
// src/interactions/buttons/roll.ts — handles "roll:again:20"
import type { ButtonHandler } from "../../lib.ts";

export default {
  id: "roll",
  async run(interaction, [action, sides]) {
    return interaction.update(`🎲 ${1 + Math.floor(Math.random() * Number(sides))}`);
  },
} satisfies ButtonHandler;
```

Build ids with template strings: `` setCustomId(`roll:again:${sides}`) ``.
There's no registration step — buttons work the moment the file exists.

Each folder gets its own lookup table, so **the same `id` in `buttons/`,
`modals/` and `selects/` doesn't collide** — they're told apart by the incoming
interaction type. Two files in the *same* folder sharing an `id` do collide, and
the last one loaded silently wins.

`selects/` covers all five select types (string, user, role, mentionable,
channel); narrow with `interaction.isStringSelectMenu()` if you need to.

Custom ids cap at 100 characters, so put a **key** in the id and the payload in
a store. `interaction.update()` edits the message the component is on; `reply()`
posts a new one. You have 3 seconds to do one or the other, or `deferUpdate()`
to buy 15 minutes.

### Forms

The `feedback` flow is one file per step, sharing the id `feedback`:

```
commands/feedback.ts               /feedback → a button
interactions/buttons/feedback.ts   button → opens the modal
interactions/modals/feedback.ts    submitted → embed + a select
interactions/selects/feedback.ts   priority picked → done
```

Two rules worth knowing: `showModal()` must be the first response to the button
(no deferring first), and the modal's own custom id is what routes the
submission. Modals use `LabelBuilder` — action rows in modals are deprecated.

## Errors

Throw `UserError` to show the user a message. Anything else that escapes a
handler is logged and the user gets a generic reply, so internals never leak.

```ts
import { UserError } from "../lib.ts";
if (!tag) throw new UserError(`No tag called \`${name}\`.`);
```

## Intents

`src/index.ts` starts with `GatewayIntentBits.Guilds` — enough for slash
commands and components. `GuildMembers` and `MessageContent` are privileged and
must be enabled in the Developer Portal before you add them.
