import {
  Collection,
  CommandInteraction,
  GuildMember,
  Message,
  Role,
  RoleResolvable,
} from "discord.js";
import Command from "../../framework/Command";

export default class AddCommand extends Command {
  constructor() {
    super({
      name: "add",
      aliases: ["remind"],
      description: "Sets a reminder",
      usage:
        "add <reminder type (dm, everyone, role name, none)> <reminder date> <reminder content>",
      category: "Remind",
      slashCommand: true,
      args: [
        {
          name: "type",
          description: "Type of reminder",
          type: "STRING",
          match: "word",
          choices: [
            {
              name: "dm",
              value: "dm",
            },
            {
              name: "everyone",
              value: "everyone",
            },
            {
              name: "role",
              value: "role",
            },
            {
              name: "none",
              value: "none",
            },
          ],
          required: true,
        },
        {
          name: "date",
          type: "STRING",
          match: "content",
          description: "Date to set reminder",
          required: true,
        },
        {
          name: "reminder",
          type: "STRING",
          match: "content",
          description: "Reminder",
          required: true,
        },
        {
          name: "role",
          type: "ROLE",
          match: "role",
          description: "Role to ping when reminding",
          required: false,
        },
      ],
    });
  }

  parseArgs = function (message: Message) {};

  async execute(
    message: Message | CommandInteraction,
    args: { type: string; date: string; reminder: string; role: Role }
  ) {
    console.log(args);
  }
}
