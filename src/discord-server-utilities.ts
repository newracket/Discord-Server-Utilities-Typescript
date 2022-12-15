import CustomClient from "./framework/CustomClient";
import { token } from "./../config.json";

const client = new CustomClient(token, {
  ownerID: "301200493307494400",
  intents: [
    "GUILDS",
    "GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_VOICE_STATES",
    "DIRECT_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_EMOJIS_AND_STICKERS",
  ],
  partials: ["CHANNEL"],
  ignorePermissions: ["301200493307494400"],
});

client.init();
