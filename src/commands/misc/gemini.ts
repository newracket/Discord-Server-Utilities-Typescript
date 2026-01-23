import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentContentReturnValue } from "../../framework/Typings";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import CustomClient from "../../framework/CustomClient";
import Utils from "../../framework/Utils";

export default class DefineCommand extends Command {
  readonly gemini: GoogleGenAI;

  constructor(client: CustomClient) {
    super({
      name: "gemini",
      usage: "gemini <prompt to ask gemini>",
      description: "Asks gemini a prompt",
      aliases: ["g", "chat", "ask", "prompt"],
      category: "Misc",
      slashCommand: true,
      args: [
        {
          name: "prompt",
          description: "Prompt to ask gemini",
          type: ApplicationCommandOptionType.String,
          match: "content",
          required: true,
        },
      ],
    });

    this.gemini = new GoogleGenAI({ apiKey: client.environment.geminiApiKey });
  }

  async execute(
    message: Message | ChatInputCommandInteraction,
    args: ArgumentContentReturnValue
  ) {
    if (!args.prompt) return message.reply("Prompt not specified.");

    const thinkingMessage = await message.reply("🤖 Gemini is thinking...");

    try {
      const response = await this.gemini.models.generateContent({
        model: "gemma-3-27b-it",
        contents: `Please respond to this prompt. Keep the response under 2000 characters. Prompt: \n${args.prompt}`,
      });

      if (!response.text) {
        throw new Error("Gemini did not respond")
      }

      await thinkingMessage.edit(response.text);
    } catch (error) {
      await thinkingMessage.edit(`Error: ${error}`);
    }
  }
}
