import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, EmbedBuilder, TextChannel } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentContentReturnValue } from "../../framework/Typings";
import CustomClient from "../../framework/CustomClient";
import { AIService, AIProviderType } from "../../framework/AIService";
import Utils from "../../framework/Utils";

export default class GeminiCommand extends Command {
  readonly aiProvider: AIService;

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

    this.aiProvider = new AIService(client.environment);
  }

  async execute(
    message: Message | ChatInputCommandInteraction,
    args: ArgumentContentReturnValue
  ) {
    if (!args.prompt) return message.reply("Prompt not specified.");

    const thinkingMessage = await message.reply("🤖 Gemini is thinking...");

    try {
      const response = await this.aiProvider.generateContent(AIProviderType.Groq, args.prompt);

      const messages = Utils.splitMessage(response.text);
      await thinkingMessage.edit(messages[0]);

      for (let i = 1; i < messages.length; i++) {
        await (message.channel as TextChannel)?.send(messages[i]);
      }
    } catch (error) {
      await thinkingMessage.edit(`Error: ${error}`);
    }
  }
}
