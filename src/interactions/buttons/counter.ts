/**
 * State lives in the custom id, so nothing is stored server-side.
 * `commands/counter.ts` imports `counterView` from here, so the id format is
 * written once, beside the code that parses it.
 */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { ButtonHandler } from "../../lib.ts";

export function counterView(count: number, step: number) {
  return {
    content: `**Count:** ${count}`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`counter:add:${count}:${-step}`)
          .setLabel(`−${step}`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`counter:add:${count}:${step}`)
          .setLabel(`+${step}`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`counter:reset:${step}`)
          .setLabel("Reset")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(count === 0),
      ),
    ],
  };
}

export default {
  id: "counter",

  // `interaction` is a ButtonInteraction — no narrowing needed, the folder said so.
  async run(interaction, [action, ...rest]) {
    if (action === "reset") return interaction.update(counterView(0, Number(rest[0])));

    const [count, delta] = rest.map(Number) as [number, number];
    return interaction.update(counterView(count + delta, Math.abs(delta)));
  },
} satisfies ButtonHandler;
