import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentRoleReturnValue } from "../../framework/Typings";

export default class RoleInfoCommand extends Command {
  constructor() {
    super({
      name: "roleinfo",
      usage: "roleinfo <role>",
      description: "Displays role info",
      aliases: ['ri'],
      category: "Misc",
      channel: "guild",
      slashCommand: true,
      args: [{
        name: "role",
        description: "Role to display info for",
        type: "ROLE",
        match: "role",
        required: true
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentRoleReturnValue) {
    const embedOutput = new MessageEmbed({
      title: `${args.role.name} role info`,
      color: args.role.color,
      fields: [{
        name: "**ID                                               **",
        value: args.role.id,
        inline: true
      }, {
        name: "**Color            **",
        value: args.role.hexColor,
        inline: true
      }, {
        name: "**Hoisted      **",
        value: args.role.hoist ? "Yes" : "No",
        inline: true
      }, {
        name: "**Mention**",
        value: `\`<@&${args.role.id}>\``,
        inline: true
      }, {
        name: "**Position    **",
        value: args.role.position.toString(),
        inline: true
      }]
    });

    await message.reply({ embeds: [embedOutput] });
  }
}