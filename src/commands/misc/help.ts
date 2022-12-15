import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import Command from "../../framework/Command";
import CustomClient from "../../framework/CustomClient";
import { ArgumentContentReturnValue } from "../../framework/Typings";

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      usage: "help <command>",
      description: "Help command",
      aliases: ["h"],
      category: "Misc",
      slashCommand: true,
      args: [
        {
          name: "command",
          description: "Command name or category name to get help for",
          type: "STRING",
          match: "content",
          required: false,
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: ArgumentContentReturnValue,
    client: CustomClient
  ) {
    let embedOutput: MessageEmbed;

    if (args.command) {
      let commandsObject = client.commandHandler.categories.find(
        (categoryCommands) =>
          (categoryCommands.first() as Command).category.toLowerCase() ===
          args.command.toLowerCase()
      );

      if (commandsObject === undefined) {
        commandsObject = client.commandHandler.commands.filter(
          (command) =>
            command.name.toLowerCase() == args.command.toLowerCase() ||
            command.aliases
              .map((e) => e.toLowerCase())
              .includes(args.command.toLowerCase())
        );
      }

      if (commandsObject.size === 0)
        return message.reply("There is no command or category with that name");

      embedOutput = new MessageEmbed({
        color: "#0099ff",
        title: `Server Helper Bot ${
          (commandsObject.first() as Command).category
        } Commands`,
        footer: {
          text: `Do ${client.commandHandler.prefix}help <category name> or ${client.commandHandler.prefix}help <command name> to get more details`,
        },
      });

      commandsObject.forEach((command) => {
        embedOutput.addField(
          `${command.name}`,
          `
          Description: \`${command.description}\`
          Usage: \`${command.usage.replace(
            new RegExp(command.name, "g"),
            client.commandHandler.prefix + command.name
          )}\`
          Aliases: \`${command.aliases.join(", ")}\``
        );
      });
    } else {
      embedOutput = new MessageEmbed({
        color: "#0099ff",
        title: "Server Helper Bot Commands",
        footer: {
          text: `Do ${client.commandHandler.prefix}help <category name> or ${client.commandHandler.prefix}help <command name> to get more details`,
        },
      });

      for (const [
        categoryName,
        categoryCommands,
      ] of client.commandHandler.categories.entries()) {
        if (categoryCommands === undefined) return;

        embedOutput.addField(
          `${categoryName}`,
          categoryCommands.map((command) => `\`${command.name}\``).join(" ")
        );
      }
    }

    message.reply({ embeds: [embedOutput] });
  }
}
