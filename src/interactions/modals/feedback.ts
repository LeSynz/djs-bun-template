/**
 * Step 2: the submitted form. Buttons and modals get their own maps, so this
 * shares the id "feedback" with ../buttons/feedback.ts without colliding.
 */
import { ActionRowBuilder, EmbedBuilder, MessageFlags, StringSelectMenuBuilder } from "discord.js";
import type { ModalHandler } from "../../lib.ts";

export default {
  id: "feedback",

  async run(interaction, [topic = "other"]) {
    const summary = interaction.fields.getTextInputValue("summary");
    const details = interaction.fields.getTextInputValue("details");

    return interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [
        new EmbedBuilder()
          .setTitle(summary)
          .setDescription(details || "_No extra details._")
          .addFields({ name: "Topic", value: topic })
          .setColor(0x5865f2),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`feedback:${topic}`)
            .setPlaceholder("How urgent is this?")
            .addOptions(
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
            ),
        ),
      ],
    });
  },
} satisfies ModalHandler;
