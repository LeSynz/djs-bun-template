// Step 1 of the form: open the modal. See ../modals/feedback.ts for step 2.
import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { ButtonHandler } from "../../lib.ts";

export default {
  id: "feedback",

  async run(interaction, [, topic = "other"]) {
    // showModal must be the first response — you can't defer before it.
    return interaction.showModal(
      new ModalBuilder()
        .setCustomId(`feedback:${topic}`)
        .setTitle("Feedback")
        // Label components replace the old action-row-per-input layout.
        .addLabelComponents(
          new LabelBuilder()
            .setLabel("Summary")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("summary")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100),
            ),
          new LabelBuilder()
            .setLabel("Details")
            .setDescription("Steps to reproduce, links, anything useful.")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("details")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false),
            ),
        ),
    );
  },
} satisfies ButtonHandler;
