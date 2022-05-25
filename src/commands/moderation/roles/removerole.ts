import { CommandInteraction, Guild, GuildMember, Message, Role } from "discord.js";
import Command from "../../../framework/Command";
import { ArgumentReturnValue } from "../../../framework/Typings";

export default class RemoveRoleCommand extends Command {
  constructor() {
    super({
      name: "removerole",
      aliases: ['rr'],
      description: "Removes a role from a user",
      usage: "removerole <role name, role id, or role ping> <user nickname, username, or ping>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ['MANAGE_ROLES'],
      slashCommand: true,
      args: [{
        name: "role",
        type: "ROLE",
        required: true,
        description: "Role to remove",
        match: "role"
      }, {
        name: "member",
        type: "USER",
        required: true,
        description: "Member to remove role to",
        match: "member"
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentReturnValue) {
    const highestRole = (message.member as GuildMember).roles.highest;
    if (highestRole.comparePositionTo(args.role as Role) <= 0) return message.reply("The role you are trying to remove is higher than your highest role.");

    await (args.member as GuildMember).roles.remove(args.role as Role);
    await message.reply(`${(args.role as Role).name} has been removed from: ${args.member}.`);
  }
}