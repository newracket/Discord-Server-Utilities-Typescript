import { CommandInteraction, GuildChannel, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentChannelReturnValue } from "../../framework/Typings";

export default class UnarchiveCommand extends Command {
  constructor() {
    super({
      name: "unarchive",
      aliases: [],
      description: "unarchives channel",
      usage:
        "unarchive <channel name> OR unarchive <channel id> OR unarchive <channel mention>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ["MANAGE_CHANNELS"],
      slashCommand: true,
      args: [
        {
          name: "channel",
          type: "CHANNEL",
          match: "channel",
          required: true,
          description: "Channel to archive.",
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: ArgumentChannelReturnValue
  ) {
    if (args.channel instanceof GuildChannel) {
      await args.channel.setParent("633161578363224067");
    } else {
      await args.channel.setArchived(false);
    }

    message.reply(`${args.channel} has been unarchived.`);
  }
}
