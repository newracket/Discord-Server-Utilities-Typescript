import { Client, Events } from "discord.js";
import UnmuteCommand from "../commands/moderation/unmute";
import CommandHandler from "./CommandHandler";
import { CustomClientOptions, EnvironmentVariables } from "./Typings";

export default class CustomClient extends Client {
  token: string;
  commandHandler: CommandHandler;
  ownerID: string;
  ignorePermissions: string[];
  environment: EnvironmentVariables;

  constructor(token: string, options: CustomClientOptions) {
    super(options);

    this.token = token;
    this.environment = options.environment;
    this.commandHandler = new CommandHandler(this);
    this.ownerID = options.ownerID;
    this.ignorePermissions =
      options?.ignorePermissions !== undefined ? options.ignorePermissions : [];
  }

  init() {
    this.login(this.token);
    this.commandHandler.loadAll();

    this.once(Events.ClientReady, () => {
      console.log("Ready!");

      this.user?.setActivity("aniket is the goat");
      
      // this.commandHandler.createSlashCommands();
      // this.commandHandler.deleteAllSlashCommands();
      this.commandHandler.createInteractionHandler();

      const server = this.guilds.cache.get("633161578363224066");
      if (server === undefined) return;

      UnmuteCommand.checkForUnmutes(server);
      setInterval(() => UnmuteCommand.checkForUnmutes(server), 60000);
      setInterval(() => server.members.fetch(), 60000);
    });
  }
}
