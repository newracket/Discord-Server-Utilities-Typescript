import { Collection, CommandInteraction, GuildMember, Message } from "discord.js";
import nicks from "../../../../jsons/nicks.json";
import { casranks, sweatranks } from "../../../../jsons/ranks.json";
import Command from "../../../framework/Command";
import JSONFileManager from "../../../framework/JsonFileManager";
import Utils from "../../../framework/Utils";


const strikesJSON = new JSONFileManager("strikes");

export default class ResetToMember extends Command {
  messagesToSend: { [key: string]: string[] } = {};

  constructor() {
    super({
      name: "resettomember",
      aliases: ['rtm'],
      description: "Removes all sweat roles and cas roles from a member",
      usage: "resettomember <mention members> <amount> OR resettomember <member nicknames> <amount>",
      category: "Sweatranks",
      channel: "guild",
      allowedRoles: ["726565862558924811", "820159352215961620"],
      slashCommand: true,
      args: [{
        name: "member",
        description: "Member to remove sweat/cas roles from",
        type: "USER",
        match: "members",
        required: true
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: { member: GuildMember[] | GuildMember, times: number }) {
    this.messagesToSend = {};

    if (isNaN(Number(args.times))) {
      args.times = 1;
    }

    if (!Array.isArray(args.member)) {
      args.member = [args.member];
    }

    if (args.member.length === 0 && message instanceof Message) {
      const messageArgs = message.content.split(" ").slice(1);
      const members = await message?.guild?.members.fetch();
      if (members === undefined) return message.reply("Error when fetching members");

      messageArgs.forEach(messageArg => {
        const properNick = Utils.getKeyFromValue(nicks, messageArg);
        if (properNick) {
          const selectedMember = (members as Collection<string, GuildMember>).get(properNick);
          if (selectedMember === undefined) return message.reply("Member not fetched properly");

          (args.member as GuildMember[]).push(selectedMember);
        }
      });

      if (args.member.length === 0) return message.reply("You didn't specify anyone to demote.");
    }

    if (Array.isArray(args.member)) {
      args.member.forEach(member => {
        this.resettomember(message, member);
      });
    }
  }

  async resettomember(message: Message | CommandInteraction, member: GuildMember): Promise<any> {
    if (message.guild === null) return message.reply("Guild does not exist");

    const rolesToRemove = [...casranks, ...sweatranks];
    const roles = member.roles.cache.filter(role => !rolesToRemove.includes(role.name)).map(r => r.id);
    roles.push("775799853077758053");

    await member.roles.set(roles);
    return message.reply(`${member} has been reset to member`);
  }
}