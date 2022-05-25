import { CommandInteraction, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentContentReturnValue } from "../../framework/Typings";
import axios from "axios";

export default class DefineCommand extends Command {
  constructor() {
    super({
      name: "define",
      usage: "define <word to define>",
      description: "Defines a word",
      aliases: [],
      category: "Misc",
      slashCommand: true,
      args: [{
        name: "word",
        description: "Word to define",
        type: "STRING",
        match: "content",
        required: true
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentContentReturnValue) {
    if (!args.word) return message.reply("Word not specified.");

    const definitionData = (await axios.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${args.word}?key=10c40550-08a5-4409-a3b1-15af69ba52ba`)).data;

    if (typeof definitionData[0] == "string") return message.reply(`Definition not found. Some possible words are: \n\n${definitionData.join(", ")}`);
    await message.reply(`__**Definitions of ${args.word}:**__\n\n${definitionData.map((definition: { shortdef: any; }, i: number) => `${i + 1}. ${definition.shortdef}`).join("\n")}`);
  }
}