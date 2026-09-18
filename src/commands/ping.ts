import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../lib.ts";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check latency."),

  async execute(interaction) {
    const response = await interaction.reply({
      content: "Pinging…",
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });
    const sent = response.resource?.message?.createdTimestamp ?? Date.now();
    await interaction.editReply(
      `Pong! \`${sent - interaction.createdTimestamp}ms\` · gateway \`${Math.round(interaction.client.ws.ping)}ms\``,
    );
  },
} satisfies Command;
