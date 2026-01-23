import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
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
          type: ApplicationCommandOptionType.String,
          match: "content",
          required: true,
        },
      ],
    });
  }

  async execute(
    message: Message | ChatInputCommandInteraction,
    args: ArgumentContentReturnValue
  ) {
    let evaledCode;
    try {
      evaledCode = evaluate(args.expression);
    } catch (error) {
      evaledCode = error;
    }

    const embed = new EmbedBuilder()
      .setTitle("Math Evaluator")
      .setDescription(`\`\`\`js\n>${args.expression}\n${evaledCode}\`\`\``)
      .setColor("Blue");

    await message.reply({ embeds: [embed] });
  }
}
