import {
  ApplicationCommandOptionData,
  ClientOptions,
  GuildChannel,
  GuildMember,
  Role,
  ThreadChannel,
} from "discord.js";

export interface CustomClientOptions extends ClientOptions {
  ownerID: string;
  ignorePermissions?: string[];
}

export type ArgumentOptions = ApplicationCommandOptionData & {
  match:
    | "content"
    | "role"
    | "last"
    | "notLast"
    | "member"
    | "members"
    | "word"
    | "channel";
  required?: boolean;
};

export interface ArgumentReturnValue {
  [key: string]:
    | string
    | Role
    | GuildMember
    | GuildMember[]
    | GuildChannel
    | ThreadChannel
    | number;
}

export interface ArgumentContentReturnValue extends ArgumentReturnValue {
  [key: string]: string;
}

export interface ArgumentRoleReturnValue extends ArgumentReturnValue {
  [key: string]: Role;
}

export interface ArgumentUserReturnValue extends ArgumentReturnValue {
  [key: string]: GuildMember;
}

export interface ArgumentChannelReturnValue extends ArgumentReturnValue {
  [key: string]: GuildChannel | ThreadChannel;
}
