import {
  ApplicationCommandOptionData,
  Collection,
  CommandInteraction,
  CommandInteractionOption,
  GuildChannel,
  GuildMember,
  Message,
  Role,
  Snowflake,
  ThreadChannel,
} from "discord.js";
import CustomClient from "./CustomClient";
import { ArgumentOptions, ArgumentReturnValue } from "./Typings";
import Utils from "./Utils";

export default class Command {
  name: string;
  description: string;
  usage: string;
  aliases: string[];
  args: ArgumentOptions[];
  category: string;
  channel: string | undefined;
  hidden: boolean;
  ownerOnly: boolean;
  allowedRoles: string[] | undefined;
  slashCommand: boolean;
  slashData: ApplicationCommandOptionData[] | undefined;
  userPermissions: string[] | undefined;
  parseArgs: Function | undefined;

  constructor(options: {
    name: string;
    description: string;
    usage: string;
    aliases: string[];
    args: ArgumentOptions[];
    category: string;
    channel?: "guild" | "dm";
    hidden?: boolean;
    ownerOnly?: boolean;
    allowedRoles?: string[];
    userPermissions?: string[];
    slashCommand?: boolean;
    slashData?: ApplicationCommandOptionData[];
  }) {
    this.name = options.name;
    this.description = options.description;
    this.usage = options.usage;
    this.aliases = options.aliases;
    this.args = options.args;
    this.category = options.category;
    this.channel = options?.channel;
    this.hidden = options?.hidden === true;
    this.ownerOnly = options?.ownerOnly === true;
    this.allowedRoles = options?.allowedRoles;
    this.userPermissions = options?.userPermissions;
    this.slashCommand = options?.slashCommand === true;
    this.slashData = options?.slashData;
  }

  async checkPerms(
    client: CustomClient,
    message: Message | CommandInteraction,
    ignorePermissions: string[],
    givenArgs?: ArgumentReturnValue
  ) {
    let authorId;
    if (message instanceof Message) {
      authorId = message.author.id;
    } else {
      authorId = message.user.id;
    }

    if (this.ownerOnly && authorId !== client.ownerID)
      return await message.reply("Only the owner may execute this command.");
    if (this.channel === "guild" && message.guild === null)
      return await message.reply("You may only use this command in servers");
    if (this.channel === "dm" && message.guild !== null)
      return await message.reply("You may only use this command in dms");

    if (!(message.member instanceof GuildMember)) return;

    if (
      this.allowedRoles !== undefined &&
      message.member?.roles.cache.find((role) =>
        (this.allowedRoles as string[]).includes(role.id)
      ) === undefined &&
      !ignorePermissions.includes(authorId)
    ) {
      return await message.reply(
        `Missing permissions. One of these roles are required: ${this.allowedRoles
          .map((e) => message.guild?.roles.cache.get(e)?.name)
          .join(", ")}`
      );
    }

    if (message instanceof CommandInteraction) {
      if (givenArgs === undefined)
        return message.reply("Required arguments not fulfilled.");
      return this.execute(message, givenArgs);
    }

    if (this.parseArgs) return await this.parseArgs(message);

    const messageWords = message.content.split(" ");
    messageWords.shift();
    let commandArgs: ArgumentReturnValue = {};

    for (const arg of this.args) {
      switch (arg.match) {
        case "content": {
          if (messageWords.length === 0 && arg.required)
            return await message.reply("Incorrect format.");

          commandArgs[arg.name] = messageWords.join(" ");
          messageWords.splice(0, messageWords.length);
          break;
        }
        case "role": {
          const roles = await message.guild?.roles.fetch();
          if (roles === undefined)
            return await message.reply("Error: Guild contains no roles.");

          let matchedRole = await Utils.resolveRole(
            messageWords.join(" "),
            roles
          );
          if (!matchedRole) {
            matchedRole = await this.findRole(roles, messageWords);
          } else {
            messageWords.splice(0, messageWords.length);
          }

          if (!matchedRole) return await message.reply("Role not found.");
          commandArgs[arg.name] = matchedRole;
          break;
        }
        case "member": {
          const members = await message.guild?.members.fetch();
          if (members === undefined)
            return await message.reply("Error: Guild contains no members.");

          let matchedMember = await Utils.resolveMember(
            messageWords.join(" "),
            members
          );
          if (!matchedMember) {
            matchedMember = await this.findMember(members, messageWords);
          } else {
            messageWords.splice(0, messageWords.length);
          }

          if (!matchedMember) return await message.reply("Member not found");
          commandArgs[arg.name] = matchedMember;
          break;
        }
        case "members": {
          const members = await message.guild?.members.fetch();
          if (members === undefined)
            return await message.reply("Error: Guild contains no members.");

          const matchedMembers = [];
          let oldLength = -1;

          while (messageWords.length !== oldLength) {
            oldLength = messageWords.length;

            let matchedMember = await Utils.resolveMember(
              messageWords.join(" "),
              members
            );
            if (!matchedMember) {
              matchedMember = await this.findMember(members, messageWords);
            } else {
              messageWords.splice(0, messageWords.length);
            }

            if (matchedMember) {
              matchedMembers.push(matchedMember);
            }
          }

          if (matchedMembers.length === 0)
            return await message.reply("Member not found");
          commandArgs[arg.name] = matchedMembers;
          break;
        }
        case "channel": {
          const channels = await message.guild?.channels.fetch();
          if (channels === undefined)
            return await message.reply("Error: Guild contains no channels.");

          let matchedChannel = await Utils.resolveChannel(
            messageWords.join(" "),
            channels
          );
          if (!matchedChannel) {
            matchedChannel = await this.findChannel(channels, messageWords);
          } else {
            messageWords.splice(0, messageWords.length);
          }

          if (!matchedChannel) return await message.reply("Channel not found.");
          commandArgs[arg.name] = matchedChannel;
          break;
        }
        case "last": {
          commandArgs[arg.name] = messageWords.splice(-1, 1).join(" ");
          break;
        }
        case "notLast": {
          commandArgs[arg.name] = messageWords
            .splice(0, messageWords.length - 1)
            .join(" ");
          break;
        }
        case "word": {
          commandArgs[arg.name] = messageWords.splice(0, 1)[0];
        }
      }
    }

    await this.execute(message, commandArgs, client);
  }

  async execute(
    message: Message | CommandInteraction,
    args: ArgumentReturnValue,
    client?: CustomClient
  ): Promise<any> {}

  async handleInteraction(
    interaction: CommandInteraction,
    client: CustomClient
  ) {
    let commandArgs: ArgumentReturnValue = {};

    interaction.options.data.forEach((arg) => {
      if (arg.type === "SUB_COMMAND") {
        commandArgs = this.getInteractionOptionValue(arg);
      } else {
        commandArgs[arg.name] = this.getInteractionOptionValue(arg);
      }

      switch (arg.type) {
        case "SUB_COMMAND":
          commandArgs[arg.name] = this.getInteractionOptionValue(arg);
          break;
        default:
          commandArgs[arg.name] = this.getInteractionOptionValue(arg);
      }
    });

    // this.execute(interaction, commandArgs);
    await this.checkPerms(
      client,
      interaction,
      client.ignorePermissions,
      commandArgs
    );
  }

  getInteractionOptionValue(options: CommandInteractionOption) {
    switch (options.type) {
      case "USER":
        return options.member as GuildMember;
      case "ROLE":
        return options.role as Role;
      case "CHANNEL":
        return options.channel as GuildChannel | ThreadChannel;
      case "SUB_COMMAND": {
        const commandArgs: any = {};
        commandArgs.type = options.name;

        options.options?.forEach((o) => {
          commandArgs[o.name] = this.getInteractionOptionValue(o);
        });

        return commandArgs;
      }
      default:
        return options.value as string;
    }
  }

  async findRole(
    roles: Collection<Snowflake, Role>,
    words: string[]
  ): Promise<Role | undefined> {
    let currentRole = "";

    for (const [i, word] of words.entries()) {
      currentRole += word + " ";
      const matchedRole = await Utils.resolveRole(currentRole, roles);

      if (matchedRole !== undefined) {
        words.splice(0, i + 1);
        return matchedRole;
      }
    }
  }

  async findMember(
    members: Collection<Snowflake, GuildMember>,
    words: string[]
  ): Promise<GuildMember | undefined> {
    let currentMember = "";

    for (const [i, word] of words.entries()) {
      currentMember += word + " ";
      const matchedMember = await Utils.resolveMember(currentMember, members);
      console.log(currentMember);
      console.log(matchedMember);

      if (matchedMember !== undefined) {
        words.splice(0, i + 1);
        return matchedMember;
      }
    }
  }

  async findChannel(
    channels: Collection<Snowflake, GuildChannel>,
    words: string[]
  ): Promise<GuildChannel | ThreadChannel | undefined> {
    let currentChannel = "";

    for (const [i, word] of words.entries()) {
      currentChannel += word + " ";
      const matchedChannel = await Utils.resolveChannel(
        currentChannel,
        channels
      );

      if (matchedChannel !== undefined) {
        words.splice(0, i + 1);
        return matchedChannel;
      }
    }
  }
}
