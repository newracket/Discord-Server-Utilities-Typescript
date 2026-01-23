// @ts-ignore
import Color from "color";
import {
  Collection,
  ColorResolvable,
  ChatInputCommandInteraction,
  Guild,
  GuildChannel,
  GuildMember,
  Message,
  NonThreadGuildBasedChannel,
  Role,
  Snowflake,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import JSONFileManager from "./JsonFileManager";

const nicks = new JSONFileManager("nicks");

export default class Utils {
  static async resolveChannel(
    text: string,
    messageOrChannels:
      | Message
      | ChatInputCommandInteraction
      | Collection<Snowflake, GuildChannel | ThreadChannel | NonThreadGuildBasedChannel>,
    caseSensitive = false
  ) {
    if (messageOrChannels == undefined) throw "Error when resolving: Message not defined";
    if (
      !(messageOrChannels instanceof Message) &&
      !(messageOrChannels instanceof Collection) &&
      !(messageOrChannels instanceof ChatInputCommandInteraction)
    )
      return undefined;

    const idMatch = text.trim().match(/^<#\d*>$/g);
    if (idMatch !== null) {
      text = idMatch[0].replace(/[<#>]/g, "");
    }

    if (messageOrChannels instanceof Message || messageOrChannels instanceof ChatInputCommandInteraction) {
      messageOrChannels = (messageOrChannels.guild as Guild).channels.cache;
    }

    if (caseSensitive) {
      return (
        messageOrChannels.get(text) ||
        messageOrChannels.find((channel) => [channel.name, channel.id].includes(text.trim()))
      );
    } else {
      return (
        messageOrChannels.get(text) ||
        messageOrChannels.find((channel) =>
          [channel.name.toLowerCase(), channel.id].includes(text.trim().toLowerCase())
        )
      );
    }
  }

  static async resolveChannels(
    text: string,
    messageOrChannels: Message | ChatInputCommandInteraction | Collection<Snowflake, GuildChannel | ThreadChannel>,
    caseSensitive = false
  ) {
    const channels = [];

    for (const word of text.split(" ")) {
      const channel = await this.resolveChannel(word, messageOrChannels, caseSensitive);

      if (channel) {
        channels.push(channel);
      }
    }

    return channels;
  }

  static async resolveRole(
    text: string,
    messageOrRoles: Message | ChatInputCommandInteraction | Collection<Snowflake, Role>,
    caseSensitive = false
  ) {
    if (messageOrRoles == undefined) throw "Error when resolving: Message not defined";
    if (
      !(messageOrRoles instanceof Message) &&
      !(messageOrRoles instanceof Collection) &&
      !(messageOrRoles instanceof ChatInputCommandInteraction)
    )
      return undefined;

    const idMatch = text.trim().match(/^<@&\d*>$/g);
    if (idMatch !== null) {
      text = idMatch[0].replace(/[<@&>]/g, "");
    }

    if (messageOrRoles instanceof Message || messageOrRoles instanceof ChatInputCommandInteraction) {
      messageOrRoles = await (messageOrRoles.guild as Guild).roles.fetch();
    }

    if (caseSensitive) {
      return messageOrRoles.get(text) || messageOrRoles.find((role) => [role.name, role.id].includes(text.trim()));
    } else {
      return (
        messageOrRoles.get(text) ||
        messageOrRoles.find((role) => [role.name.toLowerCase(), role.id].includes(text.trim().toLowerCase()))
      );
    }
  }

  static async resolveMember(
    text: string,
    messageOrMembers: Message | ChatInputCommandInteraction | Collection<Snowflake, GuildMember>,
    caseSensitive = false
  ) {
    if (messageOrMembers == undefined) throw "Error when resolving: Message not defined";
    if (
      !(messageOrMembers instanceof Message) &&
      !(messageOrMembers instanceof Collection) &&
      !(messageOrMembers instanceof ChatInputCommandInteraction)
    )
      return undefined;

    const idMatch = text.trim().match(/^<@\d*>$/g);
    if (idMatch !== null && idMatch[0].trim() === text.trim()) {
      text = idMatch[0].replace(/[<@>]/g, "");
    }

    if (messageOrMembers instanceof Message || messageOrMembers instanceof ChatInputCommandInteraction) {
      messageOrMembers = (messageOrMembers.guild as Guild).members.cache;
    }

    if (caseSensitive) {
      return (
        messageOrMembers.get(text) ||
        messageOrMembers.find((member) =>
          [member.displayName, member.id, member.user.username].includes(text.trim())
        ) ||
        messageOrMembers.get(nicks.getKeyFromValue(text.trim()))
      );
    } else {
      return (
        messageOrMembers.get(text) ||
        messageOrMembers.find((member) =>
          [member.displayName.toLowerCase(), member.id, member.user.username.toLowerCase()].includes(
            text.trim().toLowerCase()
          )
        ) ||
        messageOrMembers.get(nicks.getKeyFromValue(text.toLowerCase().trim()))
      );
    }
  }

  static async resolveMembers(
    text: string,
    messageOrMembers: Message | ChatInputCommandInteraction | Collection<Snowflake, GuildMember>,
    caseSensitive = false
  ) {
    const members = [];

    for (const word of text.split(" ")) {
      const member = await this.resolveMember(word, messageOrMembers, caseSensitive);

      if (member) {
        members.push(member);
      }
    }

    return members;
  }

  static async resolveMessage(
    channel: TextChannel | Snowflake,
    messageId: Snowflake,
    messageOrChannels?: Message | ChatInputCommandInteraction | Collection<Snowflake, TextChannel>
  ) {
    if (!(channel instanceof TextChannel)) {
      if (messageOrChannels === undefined)
        throw new TypeError("Error with code: messageOrChannels not specified in Utils.resolveMessage");
      channel = (await this.resolveChannel(channel, messageOrChannels)) as TextChannel;
    }

    const message = await channel.messages.fetch(messageId);
    return message;
  }

  static getHexFromString(inputColor: string): ColorResolvable | null {
    try {
      const colorsList = [
        "Default",
        "White",
        "Aqua",
        "Green",
        "Blue",
        "Yellow",
        "Purple",
        "LuminousVividPink",
        "Fuchsia",
        "Gold",
        "Orange",
        "Red",
        "Grey",
        "Navy",
        "DarkAqua",
        "DarkGreen",
        "DarkBlue",
        "DarkPurple",
        "DarkVividPink",
        "DarkGold",
        "DarkOrange",
        "DarkRed",
        "DarkGrey",
        "DarkerGrey",
        "LightGrey",
        "DarkNavy",
        "Blurple",
        "Greyple",
        "DarkButNotBlack",
        "NotQuiteBlack",
      ];

      const normalizedInput = inputColor.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      let color = colorsList.find((c) => c.toLowerCase() === normalizedInput);
      if (!color) {
        color = Color(inputColor).hex();
      }

      return color as ColorResolvable;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static getKeyFromValue(object: { [key: string]: any }, value: any) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  static parseDateTime(input: string): Date {
    return new Date();
  }

  /**
   * Splits a message into chunks of a maximum length.
   * @param text The text to split
   * @param maxLength The maximum length of each chunk (default: 2000)
   * @param char The character to split on (default: '\n')
   * @returns An array of message chunks
   */
  static splitMessage(
    text: string,
    { maxLength = 2000, char = "\n" } = {}
  ): string[] {
    if (text.length <= maxLength) return [text];

    const splitText = text.split(char);
    const messages: string[] = [];
    let currentMessage = "";

    for (const chunk of splitText) {
      if (currentMessage.length + chunk.length + char.length > maxLength) {
        if (currentMessage.length > 0) {
          messages.push(currentMessage);
          currentMessage = "";
        }

        // If a single chunk is longer than maxLength, split it by characters
        if (chunk.length > maxLength) {
          for (let i = 0; i < chunk.length; i += maxLength) {
            messages.push(chunk.slice(i, i + maxLength));
          }
        } else {
          currentMessage = chunk;
        }
      } else {
        currentMessage += (currentMessage.length > 0 ? char : "") + chunk;
      }
    }

    if (currentMessage.length > 0) {
      messages.push(currentMessage);
    }

    return messages;
  }
}
