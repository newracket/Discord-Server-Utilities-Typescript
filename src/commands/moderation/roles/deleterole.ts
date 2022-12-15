import { CommandInteraction, GuildMember, Message } from "discord.js";
import Command from "../../../framework/Command";
import { ArgumentRoleReturnValue } from "../../../framework/Typings";

export default class DeleteRoleCommand extends Command {
  constructor() {
    super({
      name: "deleterole",
      aliases: ["dr"],
      description: "Deletes a role",
      usage: "deleterole <role name>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ["MANAGE_ROLES"],
      slashCommand: true,
      args: [
        {
          name: "role",
          type: "ROLE",
          required: true,
          description: "Role to delete",
          match: "role",
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: ArgumentRoleReturnValue
  ) {
    const highestRole = (message.member as GuildMember).roles.highest;
    if (highestRole.comparePositionTo(args.role) <= 0)
      return message.reply(
        "The role you are trying to assign is higher than your highest role."
      );

    await args.role.delete();
    await message.reply(`${args.role.name} has been deleted.`);
  }
}
