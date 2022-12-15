import { CommandInteraction, GuildMember, Message } from "discord.js";
import Command from "../../framework/Command";

export default class ChangeNickCommand extends Command {
  constructor() {
    super({
      name: "changenick",
      aliases: ["cn"],
      description: "Changes the nickname of a member",
      usage:
        "changenick <mention members> <new nickname> OR changenick <member nicknames> <new nicknames>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ["MANAGE_NICKNAMES"],
      slashCommand: true,
      args: [
        {
          name: "member",
          description: "Member to promote",
          type: "USER",
          match: "member",
          required: true,
        },
        {
          name: "nick",
          description: "New nickname",
          type: "STRING",
          match: "content",
          required: true,
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: { member: GuildMember; nick: string }
  ) {
    await args.member.setNickname(args.nick === "default" ? null : args.nick);
    await message.reply(
      `Nickname changed for ${args.member}. New nickname is ${args.nick}.`
    );
  }
}
