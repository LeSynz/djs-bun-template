import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../lib.ts";

export default {
	data: new SlashCommandBuilder().setName("ping").setDescription("Check latency."),

	async execute(interaction) {
		const response = await interaction.reply({
			content: "pinging",
			flags: MessageFlags.Ephemeral,
			withResponse: true,
		});
		const sent = response.resource?.message?.createdTimestamp ?? Date.now();
		const roundtrip = sent - interaction.createdTimestamp;
		const gateway = Math.round(interaction.client.ws.ping);

		await interaction.editReply(`pong! roundtrip \`${roundtrip}ms\`, gateway \`${gateway}ms\``);
	},
} satisfies Command;
