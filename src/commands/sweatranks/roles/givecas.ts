import {
  Collection,
  CommandInteraction,
  GuildMember,
  Message,
  RoleResolvable,
} from "discord.js";
import nicks from "../../../../jsons/nicks.json";
import { casranks, sweatranks } from "../../../../jsons/ranks.json";
import Command from "../../../framework/Command";
import Utils from "../../../framework/Utils";

export default class GiveCasCommand extends Command {
  messagesToSend: { [key: string]: string[] } = {};

  constructor() {
    super({
      name: "givecas",
      aliases: ["gc"],
      description: "Gives cas role to a member",
      usage:
        "givecas <mention members> <amount> OR givecas <member nicknames> <amount>",
      category: "Sweatranks",
      channel: "guild",
      allowedRoles: ["726565862558924811", "820159352215961620"],
      slashCommand: true,
      args: [
        {
          name: "member",
          description: "Member to give cas to",
          type: "USER",
          match: "members",
          required: true,
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
      const messageArgs = message.content.split(" ");
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
        this.givecas(message, member);
      });
    }
  }

  async givecas(
    message: Message | CommandInteraction,
    member: GuildMember
  ): Promise<any> {
    if (message.guild === null) return message.reply("Guild does not exist");

    const lastRank = casranks
      .filter((rank) =>
        member.roles.cache.map((role) => role.name).includes(rank)
      )
      .pop() as string;

    if (casranks.indexOf(lastRank) === casranks.length - 1) {
      return message.reply(
        `This person is already ${lastRank} and cannot get any more cas roles.`
      );
    } else if (lastRank !== undefined) {
      const newCasRole = message.guild.roles.cache.find(
        (role) => role.name == casranks[casranks.indexOf(lastRank) + 1]
      );
      await member.roles.add(newCasRole as RoleResolvable);
      message.reply(
        `Successfully gave ${casranks[casranks.indexOf(lastRank) + 1]} to <@${
          member.id
        }>`
      );
    } else {
      const memberRoles = member.roles.cache
        .filter((role) => !sweatranks.includes(role.name))
        .map((role) => role.id);
      memberRoles.push("798612885362180189", "775799853077758053");

      await member.roles.set(memberRoles);
      message.reply(`Successfully gave Cas to <@${member.id}>`);
    }
  }
}
