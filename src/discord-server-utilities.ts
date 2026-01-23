import "dotenv/config";
import CustomClient from "./framework/CustomClient";
import { GatewayIntentBits, Partials } from "discord.js";

const client = new CustomClient(process.env.DISCORD_BOT_TOKEN!, {
  ownerID: "301200493307494400",
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
  ignorePermissions: ["301200493307494400"],
  environment: {
    prefix: process.env.PREFIX!,
    announcementsChannelId: process.env.ANNOUNCEMENTS_CHANNEL_ID!,
    strikesChannelId: process.env.STRIKES_CHANNEL_ID!,
    logsChannelId: process.env.LOGS_CHANNEL_ID!,
    geminiApiKey: process.env.GEMINI_API_KEY!,
  }
});

client.init();
