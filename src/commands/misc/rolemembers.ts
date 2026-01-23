import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentRoleReturnValue } from "../../framework/Typings";

export default class RoleMembersCommand extends Command {
  constructor() {
    super({
      name: "rolemembers",
      aliases: ["rm"],
      description: "Lists all members with specific role",
      usage: "rolemembers <role name>",
      category: "Misc",
      channel: "guild",
      slashCommand: true,
      args: [
        {
          name: "role",
          type: ApplicationCommandOptionType.Role,
          description: "Role to list members for",
          required: true,
          match: "role",
        },
      ],
    });
  }

  async execute(
    message: Message | ChatInputCommandInteraction,
    args: ArgumentRoleReturnValue
  ) {
    const roleMembers = [...args.role.members.values()];
    if (roleMembers.length == 0) return message.reply("No one has that role");

    const embed = new EmbedBuilder()
      .setColor(args.role.hexColor)
      .setTitle(`Members with ${args.role.name} role`)
      .setDescription(roleMembers.join(" "));

    await message.reply({ embeds: [embed] });
  }
}
