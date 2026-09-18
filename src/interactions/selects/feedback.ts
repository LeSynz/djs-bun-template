// Step 3: priority picked, flow done.
import { EmbedBuilder } from "discord.js";
import type { SelectHandler } from "../../lib.ts";

const COLORS: Record<string, number> = { low: 0x57f287, medium: 0xfee75c, high: 0xed4245 };

export default {
  id: "feedback",

  async run(interaction, [topic = "other"]) {
    const priority = interaction.values[0] ?? "low";

    // Forward to your log channel or issue tracker here.
    console.log(`[feedback:${topic}/${priority}] from ${interaction.user.tag}`);

    const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
      .setColor(COLORS[priority] ?? null)
      .addFields({ name: "Priority", value: priority, inline: true });

    return interaction.update({ content: "Thanks — sent!", embeds: [embed], components: [] });
  },
} satisfies SelectHandler;
