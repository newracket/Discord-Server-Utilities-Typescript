import { Collection, CommandInteraction, GuildMember, Message, Role, TextChannel, Util } from "discord.js";
import { strikesChannelId } from "../../../../config.json";
import nicks from "../../../../jsons/nicks.json";
import { casranks, sweatranks } from "../../../../jsons/ranks.json";
import Command from "../../../framework/Command";
import JSONFileManager from "../../../framework/JsonFileManager";
import Utils from "../../../framework/Utils";


const strikesJSON = new JSONFileManager("strikes");

export default class PromoteCommand extends Command {
  messagesToSend: { [key: string]: string[] } = {};

  constructor() {
    super({
      name: "promote",
      aliases: ['p'],
      description: "Promotes a member",
      usage: "promote <mention members> <amount> OR promote <member nicknames> <amount>",
      category: "Sweatranks",
      channel: "guild",
      allowedRoles: ["726565862558924811", "820159352215961620"],
      slashCommand: true,
      args: [{
        name: "member",
        description: "Member to promote",
        type: "USER",
        match: "members",
        required: true
      }, {
        name: "times",
        description: "Times to promote",
        type: "INTEGER",
        match: "last"
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: { member: GuildMember[] | GuildMember, times: number }) {
    this.messagesToSend = {};

    if (typeof args.times !== "number") {
      args.times = 1;
    }

    if (!Array.isArray(args.member)) {
      args.member = [args.member];
    }

    if (args.member.length == 0 && message instanceof Message) {
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

      if (args.member.length == 0) return message.reply("You didn't specify anyone to promote.");
    }

    if (Array.isArray(args.member)) {
      args.member.forEach(member => {
        this.promoteMember(message, member, member.roles.cache.map(role => role.name), args.times);
      });
    }
  }

  async promoteMember(message: Message | CommandInteraction, member: GuildMember, roles: any, repeatTimes: number): Promise<any> {
    const strikes = strikesJSON.get();

    if (message.guild === null) return message.reply("Guild does not exist");

    if (repeatTimes == 0) {
      const rolesCache = await message.guild.roles.fetch();
      roles = await Promise.all(roles.map(async (role: string) => await Utils.resolveRole(role, rolesCache)));

      await member.roles.set([...new Set(roles as Role[])]);
      Util.splitMessage(this.messagesToSend[member.displayName].join("\n")).forEach(m => message.reply(m));
      return `${member.displayName} was successfuly promoted ${this.messagesToSend[member.displayName].length} time${this.messagesToSend[member.displayName].length > 1 ? "s" : ""}`;
    }

    if (!this.messagesToSend[member.displayName]) {
      this.messagesToSend[member.displayName] = [];
    }

    if (casranks.filter(rank => roles.includes(rank)).length > 0) {
      const lastRank = casranks.filter(rank => roles.includes(rank)).pop();
      const strikesChannel = await Utils.resolveChannel(strikesChannelId, message);

      if (!(strikesChannel instanceof TextChannel)) return message.reply("Strikes channel is undefined");

      if (strikes[member.id] == undefined) {
        const newMessage = await strikesChannel.send(`${member.displayName} - 1`)
        strikes[member.id] = { "messageId": newMessage.id, "value": 1 };
        this.messagesToSend[member.displayName].push(`${member} was given his first strike.`);

        strikesJSON.set(strikes);
        return this.promoteMember(message, member, roles, repeatTimes - 1);
      }
      else if (strikes[member.id].value < 3) {
        const strikesMessage = await Utils.resolveMessage(strikesChannel, strikes[member.id].messageId);
        strikes[member.id].value += 1;

        if (strikes[member.id].value == 3) {
          await strikesMessage.edit(`${member.displayName} - ${strikes[member.id].value} (Removed ${lastRank} Role)`);
          this.messagesToSend[member.displayName].push(`${member} was given his last strike. He has now been promoted.`);

          roles.splice(roles.indexOf(lastRank), 1);
          delete strikes[member.id];
          strikesJSON.set(strikes);

          return this.promoteMember(message, member, roles, repeatTimes - 1);
        }
        else {
          await strikesMessage.edit(`${member.displayName} - ${strikes[member.id].value}`);
          this.messagesToSend[member.displayName].push(`${member} was given his second strike.`);
          strikesJSON.set(strikes);

          return this.promoteMember(message, member, roles, repeatTimes - 1);
        }
      }
    }
    else {
      const lastRank = sweatranks.filter(rank => roles.includes(rank)).pop();
      if (lastRank === undefined) return message.reply("Error in code: lastrank is undefined");

      if (sweatranks.indexOf(lastRank) != sweatranks.length - 1) {
        roles.push(sweatranks[sweatranks.indexOf(lastRank) + 1]);

        if (member.displayName == "aniket") {
          this.messagesToSend[member.displayName].push(`${member} was promoted to ${sweatranks[sweatranks.indexOf(lastRank) + 1]}. This is a cap promotion.`);
        }
        else {
          this.messagesToSend[member.displayName].push(`${member} was promoted to ${sweatranks[sweatranks.indexOf(lastRank) + 1]}.`);
        }
        return this.promoteMember(message, member, roles, repeatTimes - 1);
      }
      else {
        this.messagesToSend[member.displayName].push("Error. This person is already maximum sweat.");
        return this.promoteMember(message, member, roles, 0);
      }
    }
  }
}