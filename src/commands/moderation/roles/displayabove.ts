import { CommandInteraction, Message, Role } from "discord.js";
import Command from "../../../framework/Command";
import { ArgumentRoleReturnValue } from "../../../framework/Typings";

export default class DisplayAboveCommand extends Command {
  constructor() {
    super({
      name: "displayabove",
      aliases: ['da'],
      description: "Displays a role above a different role",
      usage: "displayabove <role name or id> <role name or id>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ['MANAGE_ROLES'],
      slashCommand: true,
      args: [{
        name: "roleone",
        type: "ROLE",
        match: "role",
        description: "Role to display above other role",
        required: true
      }, {
        name: "roletwo",
        type: "ROLE",
        match: "role",
        description: "Role that other role will be displayed above.",
        required: true
      }],
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentRoleReturnValue) {
    if (args.roleone.equals(args.roletwo)) return message.reply("Second role not specified, or roles are the same");

    await args.roleone.setHoist(true);
    if (Role.comparePositions(args.roleone, args.roletwo) < -1) {
      await args.roleone.setPosition(args.roletwo.position);
    }

    await message.reply(`${args.roleone.name} will now be displayed above ${args.roletwo.name}.`);
  }
}