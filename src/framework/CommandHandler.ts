import { ApplicationCommandData, Collection, CommandInteraction } from "discord.js";
import fs from "fs";
import path from "path";
import { prefix } from "../../config.json";
import Command from "./Command";
import CustomClient from "./CustomClient";


export default class CommandHandler {
  commands: Collection<string, Command>;
  categories: Collection<string, Collection<string, Command>>;
  client: CustomClient;
  prefix;

  constructor(client: CustomClient) {
    this.commands = new Collection();
    this.categories = new Collection();
    this.prefix = prefix;

    this.client = client;
  }

  load(dir: string, file: string) {
    const commandFile = require(`${dir}/${file.replace("\.ts|\.js", "")}`).default;
    const command: Command = new commandFile();

    if (!this.categories.has(command.category)) {
      this.categories.set(command.category, new Collection());
    }

    this.commands.set(command.name, command);
    this.categories.get(command.category)?.set(command.name, command);
  }

  loadAllFromDir(dir: string) {
    const commandFiles = fs.readdirSync(path.join(__dirname, dir));
    commandFiles.forEach(commandFile => {
      if (commandFile.endsWith(".ts") || commandFile.endsWith(".js")) {
        return this.load(dir, commandFile);
      }

      const commandFileObject = fs.lstatSync(path.join(__dirname, `${dir}/${commandFile}`));
      if (commandFileObject.isDirectory()) {
        this.loadAllFromDir(`${dir}/${commandFile}`);
      }
    });
  }

  loadAll() {
    this.loadAllFromDir("../commands");

    this.setupMessageHandler();
  }

  setupMessageHandler() {
    this.client.on("messageCreate", async message => {
      if (message.author.id === this.client.user?.id) return;

      if (message.channel.id === "819649988757291015") {
        this.commands.get("tts")?.execute(message, { content: message.content });
      }

      if (!message.content.startsWith(prefix)) return;

      const args = message.content.split(" ");
      const command = (args.shift() as string).slice(1);
      let commandObject = this.commands.get(command);

      if (commandObject === undefined) {
        const matchedAliases = this.client.commandHandler.commands.filter(e => e.aliases.includes(command));

        if (matchedAliases.size !== 0) {
          commandObject = matchedAliases.first();
        }
      }

      if (commandObject !== undefined) {
        try {
          await commandObject.checkPerms(this.client, message, this.client.ignorePermissions);
        }
        catch (error) {
          await message.reply(`Error: ${(error as Error).message}`);
        }
      }
    });
  }

  async createSlashCommands() {
    const allSlashData: ApplicationCommandData[] = [];
    const guild = await this.client.guilds.fetch("633161578363224066");

    for (const command of this.commands.values()) {
      if (command.slashCommand === false) return;

      const commandData: ApplicationCommandData = {
        name: command.name,
        description: command.description,
        type: "CHAT_INPUT",
        options: command.slashData === undefined ? command.args : command.slashData
      }

      allSlashData.push(commandData);

      // let permissions: ApplicationCommandPermissionData[] | undefined;
      // if (command.ownerOnly === true) {
      //   permissions = [{
      //     id: this.client.ownerID,
      //     type: "USER",
      //     permission: true
      //   }]
      // } else if (command.allowedRoles !== undefined) {
      //   permissions = command.allowedRoles.map(roleId => { return { id: roleId, type: "ROLE", permission: true } });
      // }

      // if (permissions !== undefined) {
      //   specialPermissions.push({ name: command.name, permissions });
      // }
    };

    const createdSlashCommands = await guild.commands.set(allSlashData);
    // for (const specialPermission of specialPermissions) {
    //   const slashCommand = createdSlashCommands.find(c => c.name == specialPermission.name);

    //   if (slashCommand !== undefined) {
    //     slashCommand.permissions.set({ permissions: specialPermission.permissions });
    //   }
    // }

    this.createInteractionHandler();
  }

  createInteractionHandler() {
    this.client.on("interactionCreate", async interaction => {
      if (interaction instanceof CommandInteraction) {
        const commandObject = this.commands.get(interaction.commandName);

        if (commandObject !== undefined) {
          try {
            commandObject.handleInteraction(interaction, this.client);
          } catch (error) {
            await interaction.reply((error as Error).message);
          }
        }
      }
    });
  }
}