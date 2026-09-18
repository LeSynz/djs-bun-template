import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "../lib.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show someone's avatar.")
    .addUserOption((o) => o.setName("user").setDescription("Defaults to you.")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const url = user.displayAvatarURL({ size: 1024 });
    await interaction.reply({
      embeds: [new EmbedBuilder().setTitle(user.tag).setImage(url).setColor(0x5865f2)],
    });
  },
} satisfies Command;
