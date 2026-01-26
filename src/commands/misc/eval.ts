import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
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
      allowedMembers: ["301200493307494400", "482347801112739850"],
      slashCommand: true,
      args: [
        {
          name: "code",
          description: "Code to evaluate",
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
    let evaledCode = "Error";

    try {
      evaledCode = eval(args.code);
    } catch (error) {
      evaledCode = (error as Error).message;
    }

    const embed = new EmbedBuilder()
      .setTitle("Evalute Code")
      .setDescription(`\`\`\`js\n>${args.code}\n${evaledCode}\`\`\``)
      .setColor("Blue");

    await message.reply({ embeds: [embed] });
  }
}
