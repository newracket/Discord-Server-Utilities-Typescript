import { Collection, ColorResolvable, CommandInteraction, Guild, GuildChannel, GuildMember, Message, Role, Snowflake, TextChannel, ThreadChannel } from "discord.js";
import JSONFileManager from "./JsonFileManager";
// @ts-ignore
import Color from "color";

const nicks = new JSONFileManager("nicks");

export default class Utils {
  static async resolveChannel(text: string, messageOrChannels: Message | CommandInteraction | Collection<Snowflake, GuildChannel | ThreadChannel>, caseSensitive = false) {
    if (messageOrChannels == undefined) throw "Error when resolving: Message not defined";
    if (!(messageOrChannels instanceof Message) && !(messageOrChannels instanceof Collection) && !(messageOrChannels instanceof CommandInteraction)) return undefined;

    const idMatch = text.match(/<#\d*>/g);
    if (idMatch !== null) {
      text = idMatch[0].replace(/[<#>]/g, "");
    }

    if (messageOrChannels instanceof Message || messageOrChannels instanceof CommandInteraction) {
      messageOrChannels = (messageOrChannels.guild as Guild).channels.cache;
    }

    if (caseSensitive) {
      return messageOrChannels.get(text) || messageOrChannels.find(channel => [channel.name, channel.id].includes(text.trim()));
    }
    else {
      return messageOrChannels.get(text) || messageOrChannels.find(channel => [channel.name.toLowerCase(), channel.id].includes(text.trim().toLowerCase()));
    }
  }

  static async resolveChannels(text: string, messageOrChannels: Message | CommandInteraction | Collection<Snowflake, GuildChannel | ThreadChannel>, caseSensitive = false) {
    const channels = [];

    for (const word of text.split(" ")) {
      const channel = await this.resolveChannel(word, messageOrChannels, caseSensitive);

      if (channel) {
        channels.push(channel);
      }
    }

    return channels;
  }

  static async resolveRole(text: string, messageOrRoles: Message | CommandInteraction | Collection<Snowflake, Role>, caseSensitive = false) {
    if (messageOrRoles == undefined) throw "Error when resolving: Message not defined";
    if (!(messageOrRoles instanceof Message) && !(messageOrRoles instanceof Collection) && !(messageOrRoles instanceof CommandInteraction)) return undefined;

    const idMatch = text.match(/<@&\d*>/g);
    if (idMatch !== null) {
      text = idMatch[0].replace(/[<@&>]/g, "");
    }

    if (messageOrRoles instanceof Message || messageOrRoles instanceof CommandInteraction) {
      messageOrRoles = await (messageOrRoles.guild as Guild).roles.fetch();
    }

    if (caseSensitive) {
      return messageOrRoles.get(text) || messageOrRoles.find(role => [role.name, role.id].includes(text.trim()));
    }
    else {
      return messageOrRoles.get(text) || messageOrRoles.find(role => [role.name.toLowerCase(), role.id].includes(text.trim().toLowerCase()));
    }
  }

  static async resolveMember(text: string, messageOrMembers: Message | CommandInteraction | Collection<Snowflake, GuildMember>, caseSensitive = false) {
    if (messageOrMembers == undefined) throw "Error when resolving: Message not defined";
    if (!(messageOrMembers instanceof Message) && !(messageOrMembers instanceof Collection) && !(messageOrMembers instanceof CommandInteraction)) return undefined;

    const idMatch = text.trim().match(/<@!\d*>/g);
    if (idMatch !== null && idMatch[0].trim() === text.trim()) {
      text = idMatch[0].replace(/[<@!>]/g, "");
    }

    if (messageOrMembers instanceof Message || messageOrMembers instanceof CommandInteraction) {
      messageOrMembers = await (messageOrMembers.guild as Guild).members.fetch();
    }

    if (caseSensitive) {
      return messageOrMembers.get(text) || messageOrMembers.find(member => [member.displayName, member.id].includes(text.trim()))
        || messageOrMembers.get(nicks.getKeyFromValue(text.trim()));
    }
    else {
      return messageOrMembers.get(text) || messageOrMembers.find(member => [member.displayName.toLowerCase(), member.id].includes(text.trim().toLowerCase()))
        || messageOrMembers.get(nicks.getKeyFromValue(text.toLowerCase().trim()));
    }
  }

  static async resolveMembers(text: string, messageOrMembers: Message | CommandInteraction | Collection<Snowflake, GuildMember>, caseSensitive = false) {
    const members = [];

    for (const word of text.split(" ")) {
      const member = await this.resolveMember(word, messageOrMembers, caseSensitive);

      if (member) {
        members.push(member);
      }
    }

    return members;
  }

  static async resolveMessage(channel: TextChannel | Snowflake, messageId: Snowflake, messageOrChannels?: Message | CommandInteraction | Collection<Snowflake, TextChannel>) {
    if (!(channel instanceof TextChannel)) {
      if (messageOrChannels === undefined) throw new TypeError("Error with code: messageOrChannels not specified in Utils.resolveMessage");
      channel = await this.resolveChannel(channel, messageOrChannels) as TextChannel;
    }

    const message = await channel.messages.fetch(messageId);
    return message;
  }

  static getHexFromString(inputColor: string): ColorResolvable | null {
    try {
      const colorsList = ["default", "white", "aqua", "green", "blue", "yellow", "purple", "luminous_vivid_pink", "gold", "orange", "red", "grey", "darker_grey", "navy", "dark_aqua", "dark_green", "dark_blue", "dark_purple", "dark_vivid_pink", "dark_gold", "dark_orange", "dark_red", "dark_grey", "light_grey", "dark_navy", "blurple", "greyple", "dark_but_not_black", "not_quite_black", "random"];

      let color = colorsList.find(c => c.toLowerCase() === inputColor)?.toUpperCase();
      if (!color) {
        color = Color(inputColor).rgb().array();
      }

      return color as ColorResolvable;
    }
    catch (error) {
      console.log(error);
      return null;
    }
  }

  static getKeyFromValue(object: { [key: string]: any }, value: any) {
    return Object.keys(object).find(key => object[key] === value);
  }

  static parseDateTime(input: string): Date {
    return new Date();
  }
}