// A right-click → Apps command. Same folder, different shape.
import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder } from "discord.js";
import type { ContextCommand } from "../lib.ts";

export default {
  data: new ContextMenuCommandBuilder()
    .setName("View avatar")
    .setType(ApplicationCommandType.User),

  async execute(interaction) {
    if (!interaction.isUserContextMenuCommand()) return;
    const url = interaction.targetUser.displayAvatarURL({ size: 1024 });
    await interaction.reply({ embeds: [new EmbedBuilder().setImage(url).setColor(0x5865f2)] });
  },
} satisfies ContextCommand;
