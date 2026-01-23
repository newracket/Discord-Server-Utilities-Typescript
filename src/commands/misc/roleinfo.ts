import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentRoleReturnValue } from "../../framework/Typings";

export default class RoleInfoCommand extends Command {
  constructor() {
    super({
      name: "roleinfo",
      usage: "roleinfo <role>",
      description: "Displays role info",
      aliases: ["ri"],
      category: "Misc",
      channel: "guild",
      slashCommand: true,
      args: [
        {
          name: "role",
          description: "Role to display info for",
          type: ApplicationCommandOptionType.Role,
          match: "role",
          required: true,
        },
      ],
    });
  }

  async execute(
    message: Message | ChatInputCommandInteraction,
    args: ArgumentRoleReturnValue
  ) {
    const embedOutput = new EmbedBuilder()
      .setTitle(`${args.role.name} role info`)
      .setColor(args.role.color)
      .addFields([
        {
          name: "**ID                                               **",
          value: args.role.id,
          inline: true,
        },
        {
          name: "**Color            **",
          value: args.role.hexColor,
          inline: true,
        },
        {
          name: "**Hoisted      **",
          value: args.role.hoist ? "Yes" : "No",
          inline: true,
        },
        {
          name: "**Mention**",
          value: `\`<@&${args.role.id}>\``,
          inline: true,
        },
        {
          name: "**Position    **",
          value: args.role.position.toString(),
          inline: true,
        },
      ]);

    await message.reply({ embeds: [embedOutput] });
  }
}
