import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../lib.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription("Send the maintainers some feedback.")
    .addStringOption((o) =>
      o
        .setName("topic")
        .setDescription("What's this about?")
        .setRequired(true)
        .addChoices(
          { name: "Bug report", value: "bug" },
          { name: "Feature idea", value: "idea" },
        ),
    ),

  async execute(interaction) {
    const topic = interaction.options.getString("topic", true);
    await interaction.reply({
      content: "Click below to open the form.",
      flags: MessageFlags.Ephemeral,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`feedback:open:${topic}`)
            .setLabel("Open form")
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });
  },
} satisfies Command;
