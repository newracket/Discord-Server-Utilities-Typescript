import { CommandInteraction, Message, MessageEmbed } from "discord.js";
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
          type: "ROLE",
          description: "Role to list members for",
          required: true,
          match: "role",
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: ArgumentRoleReturnValue
  ) {
    const roleMembers = [...args.role.members.values()];
    if (roleMembers.length == 0) return message.reply("No one has that role");

    const embed = new MessageEmbed({
      color: args.role.hexColor,
      title: `Members with ${args.role.name} role`,
      description: roleMembers.join(" "),
    });

    await message.reply({ embeds: [embed] });
  }
}
