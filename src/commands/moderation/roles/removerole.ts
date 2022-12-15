import { CommandInteraction, GuildMember, Message, Role } from "discord.js";
import Command from "../../../framework/Command";

export default class RemoveRoleCommand extends Command {
  constructor() {
    super({
      name: "removerole",
      aliases: ["rr"],
      description: "Removes a role from a user",
      usage:
        "removerole <role name, role id, or role ping> <user nickname, username, or ping>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ["MANAGE_ROLES"],
      slashCommand: true,
      args: [
        {
          name: "role",
          type: "ROLE",
          required: true,
          description: "Role to remove",
          match: "role",
        },
        {
          name: "member",
          type: "USER",
          required: true,
          description: "Member to remove role to",
          match: "members",
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: { member: GuildMember | GuildMember[]; role: Role }
  ) {
    if (!Array.isArray(args.member) && args.member instanceof GuildMember) {
      args.member = [args.member];
    }

    args.member.forEach(async (m) => {
      const highestRole = (message.member as GuildMember).roles.highest;
      if (highestRole.comparePositionTo(args.role) <= 0)
        return message.reply(
          "The role you are trying to remove is higher than your highest role."
        );

      await m.roles.remove(args.role);
      await message.reply(`${args.role.name} has been remove from: ${m}.`);
    });
  }
}
