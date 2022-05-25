import { CommandInteraction, GuildChannel, Message } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentChannelReturnValue } from "../../framework/Typings";

export default class ArchiveCommand extends Command {
  constructor() {
    super({
      name: "archive",
      aliases: [],
      description: "Archives channel",
      usage: "archive <channel name> OR archive <channel id> OR archive <channel mention>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ['MANAGE_CHANNELS'],
      slashCommand: true,
      args: [{
        name: "channel",
        type: "CHANNEL",
        match: "channel",
        required: true,
        description: "Channel to archive."
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentChannelReturnValue) {
    if (args.channel instanceof GuildChannel) {
      await args.channel.setParent("649775722306732040");
    } else {
      await args.channel.setArchived(true);
    }

    message.reply(`${args.channel} has been archived.`);
  }
}