import { CommandInteraction, Message, Role } from "discord.js";
import Command from "../../../framework/Command";
import Utils from "../../../framework/Utils";

export default class ModifyRoleCommand extends Command {
  constructor() {
    super({
      name: "modifyrole",
      aliases: ["mr"],
      description: "Modifies role",
      usage: "modifyrole <modify type> <role name or id> <new value>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ["MANAGE_ROLES"],
      args: [
        {
          name: "type",
          match: "word",
          description: "How to modify role",
          type: "STRING",
        },
        {
          name: "role",
          match: "role",
          description: "Role to modify",
          type: "ROLE",
        },
        {
          name: "value",
          match: "content",
          description: "New value",
          type: "STRING",
        },
      ],
      slashCommand: true,
      slashData: [
        {
          type: "SUB_COMMAND",
          name: "name",
          description: "Modifies the name of a role",
          options: [
            {
              name: "role",
              type: "ROLE",
              description: "Role to modify",
              required: true,
            },
            {
              name: "value",
              type: "STRING",
              description: "New value",
              required: true,
            },
          ],
        },
        {
          type: "SUB_COMMAND",
          name: "color",
          description: "Modifies the color of a role",
          options: [
            {
              name: "role",
              type: "ROLE",
              description: "Role to modify",
              required: true,
            },
            {
              name: "value",
              type: "STRING",
              description: "New value",
              required: true,
            },
          ],
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: { type: string; role: Role; value: string }
  ) {
    switch (args.type.toLowerCase()) {
      case "name":
        await args.role.setName(args.value);
        return await message.reply(
          `The new name of your role is ${args.value}`
        );
      case "color":
        const newColor = Utils.getHexFromString(args.value);
        if (newColor === null)
          return await message.reply("The color is invalid");

        await args.role.setColor(newColor);
        return await message.reply(
          `The new color of ${args.role.name} is ${args.role.hexColor}`
        );
      default:
        return await message.reply("Modify type is invalid.");
    }
  }
}
