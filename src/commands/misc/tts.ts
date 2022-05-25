import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { CommandInteraction, GuildMember, Message, StageChannel, VoiceChannel } from "discord.js";
// @ts-ignore
import gTTS from "gtts";
import Command from "../../framework/Command";
import JSONFileManager from "../../framework/JsonFileManager";
import { ArgumentContentReturnValue } from "../../framework/Typings";
import Utils from "../../framework/Utils";

const nicksJSON = new JSONFileManager("nicks");

export default class TtsCommand extends Command {
  playing = false;

  constructor() {
    super({
      name: "tts",
      aliases: [],
      description: "Converts text message to speech and sends in voice channel",
      usage: "tts <message>",
      category: "Misc",
      slashCommand: true,
      args: [{
        name: "content",
        type: "STRING",
        match: "content",
        description: "Text to conver to speech",
        required: true
      }]
    });
  }

  async execute(message: Message | CommandInteraction, args: ArgumentContentReturnValue) {
    const nicks = nicksJSON.get();

    if (args.content.length < 0) {
      await message.reply("No message to say.");
    }
    else if (args.content.length > 400) {
      await message.reply("Message exceeds character limit of 400.");
    }
    else {
      const that = this;

      if (!this.playing) {
        let playingTimeout: ReturnType<typeof setTimeout> | undefined;

        try {
          let authorId = (message as Message)?.author?.id;

          if (message instanceof CommandInteraction) {
            message.deferReply();
            authorId = message.user.id;
          }

          this.playing = true;
          let voiceChannel: VoiceChannel | StageChannel | null;

          playingTimeout = setTimeout(() => {
            if (that.playing) {
              that.playing = false;
            }
          }, 20000);

          voiceChannel = (message.member as GuildMember).voice.channel;
          if (!voiceChannel) {
            voiceChannel = await Utils.resolveChannel("633161578363224070", message) as VoiceChannel | StageChannel | null;
          }

          if (voiceChannel === null) return await message.reply("Voice channel is null");

          const nickname = nicks[authorId] != undefined ? nicks[authorId] : (message.member as GuildMember).displayName;
          const speech = nickname + " says " + args.content.split(" ").map(e => {
            if (e[0] == "<" && e[1] == ":" && e[e.length - 1] == ">") {
              return e.split(":")[1];
            }
            return e;
          }).join(" ");
          const gtts = new gTTS(speech, "en");

          const player = createAudioPlayer();
          const resource = createAudioResource(gtts.stream());

          player.play(resource);

          const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: voiceChannel.guild.id, adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator });
          try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
          }
          catch (error) {
            await message.reply((error as Error).message);
          }

          connection.subscribe(player);

          let started = false;
          player.on(AudioPlayerStatus.Playing, () => {
            started = true;
          })

          player.on(AudioPlayerStatus.Idle, () => {
            if (!started) return;

            connection.destroy();
            that.playing = false;
            clearTimeout(playingTimeout as ReturnType<typeof setTimeout>);

            if (message instanceof CommandInteraction) {
              message.editReply(`Said the message "${args.content}" in ${(voiceChannel as VoiceChannel).name}.`);
            }
          });
        }
        catch (error) {
          await message.reply("Error: " + (error as Error).message);

          that.playing = false;

          if (playingTimeout !== undefined) {
            clearTimeout(playingTimeout);
          }
        }
      }
      else {
        await message.reply("Someone else is already using this.");
      }
    }
  }
}