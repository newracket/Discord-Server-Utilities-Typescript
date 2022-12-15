import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentContentReturnValue } from "../../framework/Typings";
import { evaluate } from "mathjs";

export default class MathCommand extends Command {
  constructor() {
    super({
      name: "math",
      usage: "math <math function>",
      description: "Evalutes a math function",
      aliases: [],
      category: "Misc",
      slashCommand: true,
      args: [
        {
          name: "expression",
          description: "Math function to evaluate",
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
    let evaledCode;
    try {
      evaledCode = evaluate(args.expression);
    } catch (error) {
      evaledCode = error;
    }

    const embed = new MessageEmbed({
      title: "Math Evaluator",
      description: `\`\`\`js\n>${args.expression}\n${evaledCode}\`\`\``,
      color: "BLUE",
    });

    await message.reply({ embeds: [embed] });
  }
}
