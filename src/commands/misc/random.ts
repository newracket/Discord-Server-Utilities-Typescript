import { CommandInteraction, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentContentReturnValue } from "../../framework/Typings";

export default class RandomCommand extends Command {
  constructor() {
    super({
      name: "random",
      usage:
        "random <options to randomly choose from, separated by spaces or commas>",
      description: "Randomly chooses selection from given choices",
      aliases: [],
      category: "Misc",
      slashCommand: true,
      args: [
        {
          name: "options",
          description: "Options to randomly select from",
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
    if (!args.options) args.options = "all";

    let randomOptions = args.options.split(",");
    if (args.options.trim() == "all") {
      randomOptions = [
        "aniket",
        "aaron",
        "achintya",
        "alan",
        "david",
        "eric",
        "gio",
        "john",
        "justin",
        "mena",
        "oscar",
      ];
    } else if (!args.options.includes(",")) {
      randomOptions = args.options.split(" ");
    }
    const randomIndex = Math.floor(Math.random() * randomOptions.length);

    await message.reply(
      `Your random selection is: ${randomOptions[randomIndex].trim()}`
    );
  }
}
