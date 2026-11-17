import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../lib.ts";

export default {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("Show a user's avatar.")
		.addUserOption((o) => o.setName("user").setDescription("Defaults to you")),

	async execute(interaction) {
		const user = interaction.options.getUser("user") ?? interaction.user;
		const embed = new EmbedBuilder()
			.setTitle(`${user.displayName}'s avatar`)
			.setImage(user.displayAvatarURL({ size: 1024 }))
			.setColor(0x5865f2);

		await interaction.reply({ embeds: [embed] });
	},
} satisfies Command;
