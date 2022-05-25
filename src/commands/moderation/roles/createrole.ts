import { ColorResolvable, CommandInteraction, Guild, Message } from "discord.js";
import Command from "../../../framework/Command";
import { ArgumentContentReturnValue } from "../../../framework/Typings";
import Utils from "../../../framework/Utils";

export default class CreateRoleCommand extends Command {
  constructor() {
    super({
      name: "createrole",
      aliases: ['cr'],
      description: "Creates a role",
      usage: "createrole <role name> <role color>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ['MANAGE_ROLES'],
      slashCommand: true,
      args: [{
        name: "name",
        type: "STRING",
        description: "Name of role to create",
        required: true,
        match: "notLast"
      }, {
        name: "color",
        type: "STRING",
        description: "Color of role to create",
        required: true,
        match: "last"
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentContentReturnValue) {
    const color = Utils.getHexFromString(args.color);
    if (color === null) return message.reply("The color is invalid");

    const role = await (message.guild as Guild).roles.create({ name: args.name, color: color as ColorResolvable });
    await message.reply(`<@&${role.id}> has been created.`);
  }
}