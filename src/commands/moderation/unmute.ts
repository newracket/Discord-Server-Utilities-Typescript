import { CommandInteraction, Guild, GuildMember, Message } from "discord.js";
import Command from "../../framework/Command";
import JSONFileManager from "../../framework/JsonFileManager";

const mutedJSONManager = new JSONFileManager("muted");

export default class UnmuteCommand extends Command {
  constructor() {
    super({
      name: "unmute",
      aliases: [],
      description: "Unmutes users",
      usage: "unmute <mention member/member id/member nickname>",
      category: "Moderation",
      channel: "guild",
      userPermissions: ["ADMINISTRATOR"],
      slashCommand: true,
      args: [
        {
          name: "member",
          match: "member",
          type: "USER",
          required: true,
          description: "Member to unmute",
        },
      ],
    });
  }

  async execute(
    message: Message | CommandInteraction,
    args: { member: GuildMember }
  ) {
    await UnmuteCommand.unmute(args.member);

    await message.reply(`${args.member} has been unmuted.`);
  }

  static async unmute(member: GuildMember) {
    const mutedID = "806387819432902656";
    const adminID = "633163401907929088";
    await member.roles.remove(mutedID);

    const mutedJSON: {
      mutedAdmins: string[];
      unmuteQue: { member: string; time: number }[];
    } = mutedJSONManager.get();
    if (!mutedJSON.mutedAdmins) {
      mutedJSON.mutedAdmins = [];
    }

    if (mutedJSON.mutedAdmins.includes(member.id)) {
      mutedJSON.mutedAdmins = mutedJSON.mutedAdmins.filter(
        (id) => id != member.id
      );
      mutedJSON.unmuteQue = mutedJSON.unmuteQue.filter(
        (e) => e.member !== member.id
      );
      mutedJSONManager.set(mutedJSON);
      await member.roles.add(adminID);
    }
  }

  static async checkForUnmutes(guild: Guild) {
    const unmuteQue: { member: string; time: number }[] =
      mutedJSONManager.getValue("unmuteQue");
    const now = new Date().getTime();

    for (const id of unmuteQue) {
      if (now > id.time) {
        const memberObject: GuildMember = await guild.members.fetch(id.member);
        await this.unmute(memberObject);
      }
    }

    mutedJSONManager.setValue(
      "unmuteQue",
      unmuteQue.filter((e) => e.time > now)
    );
  }
}
