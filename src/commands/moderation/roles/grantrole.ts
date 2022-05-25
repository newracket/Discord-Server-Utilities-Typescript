import { CommandInteraction, GuildMember, Message, Role } from "discord.js";
import Command from "../../../framework/Command";
import { ArgumentReturnValue } from "../../../framework/Typings";

export default class GrantRoleCommand extends Command {
  constructor() {
    super({
      name: "grantrole",
      aliases: ['grantrole', 'gr'],
      description: "Grants a role to a user",
      usage: "grantrole <role name, role id, or role ping> <user nickname, username, or ping>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ['MANAGE_ROLES'],
      slashCommand: true,
      args: [{
        name: "role",
        type: "ROLE",
        required: true,
        description: "Role to grant",
        match: "role"
      }, {
        name: "member",
        type: "USER",
        required: true,
        description: "Member to grant role to",
        match: "member"
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentReturnValue) {
    const highestRole = (message.member as GuildMember).roles.highest;
    if (highestRole.comparePositionTo(args.role as Role) <= 0) return message.reply("The role you are trying to assign is higher than your highest role.");

    await (args.member as GuildMember).roles.add(args.role as Role);
    await message.reply(`${(args.role as Role).name} has been given to: ${args.member}.`);
  }
}