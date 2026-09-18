import { SlashCommandBuilder } from "discord.js";
import { counterView } from "../interactions/buttons/counter.ts";
import type { Command } from "../lib.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("counter")
    .setDescription("Post a counter with buttons.")
    .addIntegerOption((o) =>
      o.setName("step").setDescription("Increment size").setMinValue(1).setMaxValue(100),
    ),

  async execute(interaction) {
    await interaction.reply(counterView(0, interaction.options.getInteger("step") ?? 1));
  },
} satisfies Command;
