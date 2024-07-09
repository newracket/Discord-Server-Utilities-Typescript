import {
  CommandInteraction,
  Message,
  Role,
  TextBasedChannel,
} from "discord.js";
import Command from "../../framework/Command";
import sqlite3 from "sqlite3";

const parseReminder = require("parse-reminder");
const db = new sqlite3.Database("reminders.db");

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

  parseArgs = function (message: Message) {
    const text = message.content;
    const output: { type: string; date: string; reminder: string } = {
      type: "none",
      date: "",
      reminder: "",
    };
    let remindObject: { what: string; when: string };
    let args = text.split(" ").slice(1);

    let matchingRole;
    if (message.guild != null) {
      matchingRole = message.guild.roles.cache.find(
        (role) =>
          role.name.toLowerCase() == args[0].toLowerCase() || role.id == args[0]
      );
    }

    if (args[0] == "dm") {
      output.type = "dm";
      args.splice(0, 1);
    } else if (args[0] == "everyone") {
      output.type = "everyone";
      args.splice(0, 1);
    } else if (matchingRole != undefined) {
      output.type = matchingRole.name;
      args.splice(0, 1);
    }

    args = args.filter((w) => w != "in");

    if (args.includes("me")) {
      remindObject = parseReminder(`remind ${args.join(" ")}`);
    } else {
      remindObject = parseReminder(`remind me ${args.join(" ")}`);
    }

    if (remindObject == null) {
      message.channel.send("Error when parsing.");
      return;
    }

    output.date = remindObject.when;
    output.reminder = remindObject.what;

    return output;
  };

  async execute(
    message: Message | CommandInteraction,
    args: { type: string; date: string; reminder: string }
  ) {
    if (message.channel == null) {
      return message.reply("You can only use this command in a server.");
    }

    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS reminders
         (
             id
             int,
             who
             TEXT,
             date
             TEXT,
             content
             TEXT,
             messageType
             TEXT
         );`,
        (err) => {
          if (err)
            return (message.channel as TextBasedChannel).send(
              `Error when creating database. ${err}`
            );
        }
      );

      if (message.guild == null) {
        return message.reply("You can only use this command in a server.");
      }

      db.all(
        `SELECT *
         FROM reminders
         ORDER BY id DESC LIMIT 1`,
        [],
        (err, rows) => {
          if (err && message.channel != null) {
            message.channel.send(
              `Error when selecting reminders from database. ${err}`
            );
            return;
          }

          if (rows.length == 0) {
            rows.push({ id: 0 });
          }

          let authorId;
          if (message instanceof Message) {
            authorId = message.author.id;
          } else {
            authorId = message.user.id;
          }

          db.run(
            `INSERT INTO reminders (id, who, date, content, messageType)
             VALUES (${rows[0].id + 1}, "${authorId}",
                     "${new Date(args.date).toString()}",
                     "${args.reminder}", "${args.type}")`,
            (err) => {
              if (message.channel == null) {
                return;
              }

              if (err) {
                message.channel.send(
                  `Error when adding reminder to database. ${err}`
                );
                return;
              }

              message.channel.send(
                `I will remind you to ${args.reminder} on ${new Date(
                  args.reminder
                ).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}. The message type is ${args.type}.`
              );
            }
          );
        }
      );
    });
  }
}
