import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentContentReturnValue } from "../../framework/Typings";

export default class EvalCommand extends Command {
  constructor() {
    super({
      name: "eval",
      usage: "eval <code to eval>",
      description: "Evalues code",
      aliases: [],
      category: "Misc",
      hidden: true,
      ownerOnly: true,
      slashCommand: true,
      args: [
        {
          name: "code",
          description: "Code to evaluate",
          type: "STRING",
          match: "content",
          required: true,
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: ArgumentContentReturnValue
  ) {
    let evaledCode = "Error";

    try {
      evaledCode = eval(args.code);
    } catch (error) {
      evaledCode = (error as Error).message;
    }

    const embed = new MessageEmbed({
      title: "Evalute Code",
      description: `\`\`\`js\n>${args.code}\n${evaledCode}\`\`\``,
      color: "BLUE",
    });

    await message.reply({ embeds: [embed] });
  }
}
