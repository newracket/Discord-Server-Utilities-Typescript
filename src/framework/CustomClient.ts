import { Client } from "discord.js";
import UnmuteCommand from "../commands/moderation/unmute";
import CommandHandler from "./CommandHandler";
import { CustomClientOptions } from "./Typings";

export default class CustomClient extends Client {
  token: string;
  commandHandler: CommandHandler;
  ownerID: string;
  ignorePermissions: string[];

  constructor(token: string, options: CustomClientOptions) {
    super(options);

    this.token = token;
    this.commandHandler = new CommandHandler(this);
    this.ownerID = options.ownerID;
    this.ignorePermissions = options?.ignorePermissions !== undefined ? options.ignorePermissions : [];
  }

  init() {
    this.login(this.token);
    this.commandHandler.loadAll();

    this.once("ready", () => {
      console.log("Ready!");

      // this.commandHandler.createSlashCommands();
      this.commandHandler.createInteractionHandler();

      const server = this.guilds.cache.get("633161578363224066");
      if (server === undefined) return;

      UnmuteCommand.checkForUnmutes(server);
      setInterval(() => UnmuteCommand.checkForUnmutes(server), 60000);
    });
  }
}