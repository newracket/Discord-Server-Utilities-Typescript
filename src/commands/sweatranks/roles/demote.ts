import {
  Collection,
  CommandInteraction,
  GuildMember,
  Message,
  Role,
  TextChannel,
  Util,
} from "discord.js";
import { strikesChannelId } from "../../../../config.json";
import nicks from "../../../../jsons/nicks.json";
import { casranks, sweatranks } from "../../../../jsons/ranks.json";
import Command from "../../../framework/Command";
import JSONFileManager from "../../../framework/JsonFileManager";
import Utils from "../../../framework/Utils";

const strikesJSON = new JSONFileManager("strikes");

export default class DemoteCommand extends Command {
  messagesToSend: { [key: string]: string[] } = {};

  constructor() {
    super({
      name: "demote",
      aliases: ["d"],
      description: "Demotes a member",
      usage:
        "demote <mention members> <amount> OR demote <member nicknames> <amount>",
      category: "Sweatranks",
      channel: "guild",
      allowedRoles: ["726565862558924811", "820159352215961620"],
      slashCommand: true,
      args: [
        {
          name: "member",
          description: "Member to demote",
          type: "USER",
          match: "members",
          required: true,
        },
        {
          name: "times",
          description: "Times to demote",
          type: "INTEGER",
          match: "last",
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: { member: GuildMember[] | GuildMember; times: number }
  ) {
    this.messagesToSend = {};

    if (typeof args.times !== "number") {
      args.times = 1;
    }

    if (!Array.isArray(args.member)) {
      args.member = [args.member];
    }

    if (args.member.length === 0 && message instanceof Message) {
      const messageArgs = message.content.split(" ").slice(1);
      const members = await message?.guild?.members.fetch();
      if (members === undefined)
        return message.reply("Error when fetching members");

      messageArgs.forEach((messageArg) => {
        const properNick = Utils.getKeyFromValue(nicks, messageArg);
        if (properNick) {
          const selectedMember = (
            members as Collection<string, GuildMember>
          ).get(properNick);
          if (selectedMember === undefined)
            return message.reply("Member not fetched properly");

          (args.member as GuildMember[]).push(selectedMember);
        }
      });

      if (args.member.length === 0)
        return message.reply("You didn't specify anyone to demote.");
    }

    if (Array.isArray(args.member)) {
      args.member.forEach((member) => {
        this.demoteMember(
          message,
          member,
          member.roles.cache.map((role) => role.name),
          args.times
        );
      });
    }
  }

  async demoteMember(
    message: Message | CommandInteraction,
    member: GuildMember,
    roles: any,
    repeatTimes: number
  ): Promise<any> {
    if (message.guild === null) return message.reply("Guild does not exist");

    if (repeatTimes === 0) {
      const rolesCache = await message.guild.roles.fetch();
      roles = await Promise.all(
        roles.map(
          async (role: string) => await Utils.resolveRole(role, rolesCache)
        )
      );

      await member.roles.set([...new Set(roles as Role[])]);
      Util.splitMessage(
        this.messagesToSend[member.displayName].join("\n")
      ).forEach((m) => message.reply(m));
      return `${member.displayName} was successfuly demoted ${
        this.messagesToSend[member.displayName].length
      } time${this.messagesToSend[member.displayName].length > 1 ? "s" : ""}`;
    }

    if (!this.messagesToSend[member.displayName]) {
      this.messagesToSend[member.displayName] = [];
    }

    const lastRank = sweatranks.filter((rank) => roles.includes(rank)).pop();
    if (lastRank !== undefined && lastRank !== "Member") {
      this.messagesToSend[member.displayName].push(
        `${member} was demoted to ${
          sweatranks[sweatranks.indexOf(lastRank) - 1]
        }.`
      );

      roles.splice(roles.indexOf(lastRank), 1);
      return this.demoteMember(message, member, roles, repeatTimes - 1);
    } else {
      const lastRank = casranks.filter((rank) => roles.includes(rank)).pop();
      const lastRankIndex = casranks.indexOf(lastRank as string);

      if (
        lastRankIndex === casranks.length - 1 &&
        !strikesJSON.hasKey(member.id)
      ) {
        this.messagesToSend[member.displayName].push(
          "Error. This person is cannot be demoted any further."
        );
        return this.demoteMember(message, member, roles, 0);
      }

      if (strikesJSON.hasKey(member.id)) {
        const strikesMessage = await Utils.resolveMessage(
          strikesChannelId,
          strikesJSON.getValue(member.id).messageId,
          message
        );
        if (strikesJSON.getValue(member.id).value === 1) {
          strikesJSON.deleteKey(member.id);

          await strikesMessage.delete();
          this.messagesToSend[member.displayName].push(
            `One strike was removed. ${member} now has 0 strikes.`
          );
        } else {
          const currentValue = strikesJSON.getValue(member.id);
          currentValue.value--;
          strikesJSON.setValue(member.id, currentValue);

          strikesMessage.edit(`${member.displayName} - ${currentValue.value}`);
          this.messagesToSend[member.displayName].push(
            `One strike was removed. ${member} now has 1 strike.`
          );
        }
      } else {
        this.messagesToSend[member.displayName].push(
          `${member} was demoted to ${
            casranks[lastRankIndex + 1]
          } with 2 strikes.`
        );
        roles.push(casranks[lastRankIndex + 1]);

        const strikesChannel = await Utils.resolveChannel(
          strikesChannelId,
          message
        );
        if (!(strikesChannel instanceof TextChannel))
          return message.reply("Error in code: strikesChannel is undefined");

        const sentMessage = await strikesChannel.send(
          `${member.displayName} - 2`
        );
        strikesJSON.setValue(member.id, {
          messageId: sentMessage.id,
          value: 2,
        });
      }
    }

    return this.demoteMember(message, member, roles, repeatTimes - 1);
  }
}
