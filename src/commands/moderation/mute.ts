import { CommandInteraction, GuildMember, Message } from "discord.js";
import Command from "../../framework/Command";
import JSONFileManager from "../../framework/JsonFileManager";
import parse from 'parse-duration';

const mutedJSONManager = new JSONFileManager("muted");

export default class MuteCommand extends Command {
  constructor() {
    super({
      name: "mute",
      aliases: [],
      description: "Mutes users",
      usage: "mute <mention member/member id/member nickname>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ['ADMINISTRATOR'],
      slashCommand: true,
      args: [{
        name: "member",
        match: "member",
        type: "USER",
        required: true,
        description: "Member to mute"
      }, {
        name: "time",
        match: "content",
        type: "STRING",
        description: "Time to mute"
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: { member: GuildMember, time: string }) {
    const mutedID = "806387819432902656";
    const adminID = "633163401907929088";

    const mutedJSON: { mutedAdmins: string[], unmuteQue: { member: string, time: number }[] } = mutedJSONManager.get();
    if (args.member.roles.cache.has(adminID)) {
      if (!("mutedAdmins" in mutedJSON)) {
        mutedJSON.mutedAdmins = [];
      }

      mutedJSON.mutedAdmins.push(args.member.id);

      await args.member.roles.remove(adminID);
    }

    if (!("unmuteQue" in mutedJSON)) {
      mutedJSON.unmuteQue = [];
    }
    mutedJSON.unmuteQue = mutedJSON.unmuteQue.filter(e => e.member !== args.member.id);

    if (args.time.length !== 0) {
      const duration = parse(args.time);
      const time = new Date().getTime() + duration;

      mutedJSON.unmuteQue.push({ member: args.member.id, time });
      await message.reply(`${args.member} has been muted until ${new Date(time).toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" })}`);
    }

    mutedJSONManager.set(mutedJSON);
    await args.member.roles.add(mutedID);

    if (args.time.length === 0) {
      await message.reply(`${args.member} has been muted indefinitely.`);
    }
  }
}