import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentContentReturnValue } from "../../framework/Typings";

export default class UpdateCommand extends Command {
  constructor() {
    super({
      name: "update",
      usage: "update",
      description: "Triggers a watchtower update",
      aliases: [],
      category: "Misc",
      slashCommand: true,
      hidden: true,
      allowedMembers: ["301200493307494400", "482347801112739850"],
      args: [],
    });
  }

  async execute(
    message: Message | ChatInputCommandInteraction,
    args: ArgumentContentReturnValue
  ) {
    const token = process.env.WATCHTOWER_TOKEN;

    if (!token) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("Update Failed")
        .setDescription("WATCHTOWER_TOKEN environment variable is not set")
        .setColor("Red");

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const response = await fetch("http://watchtower:8080/v1/update", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const embed = new EmbedBuilder()
          .setTitle("Update Triggered")
          .setDescription("Successfully triggered watchtower update")
          .setColor("Green");

        await message.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle("Update Failed")
          .setDescription(`Failed to trigger update: ${response.status} ${response.statusText}`)
          .setColor("Red");

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle("Update Error")
        .setDescription(`Error: ${error instanceof Error ? error.message : String(error)}`)
        .setColor("Red");

      await message.reply({ embeds: [embed] });
    }
  }
}
