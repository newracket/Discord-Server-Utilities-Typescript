import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message, EmbedBuilder } from "discord.js";
import Command from "../../framework/Command";
import { ArgumentUserReturnValue } from "../../framework/Typings";

export default class RolesCommand extends Command {
  constructor() {
    super({
      name: "roles",
      aliases: [],
      description: "Displays the order of roles",
      usage: "roles",
      category: "Moderation",
      channel: "guild",
      slashCommand: true,
      args: [
        {
          name: "member",
          type: ApplicationCommandOptionType.User,
          description:
            "Member to display roles of. If omitted, will display all roles. ",
          match: "content",
        },
      ],
    });
  }

  async execute(
    message: Message | ChatInputCommandInteraction,
    args: ArgumentUserReturnValue
  ) {
    let roles;

    if (!args.member) {
      roles = (await (message.guild as Guild).roles.fetch()).filter(
        (role) => role.position != 0
      );
    } else {
      roles = args.member.roles.cache.filter((role) => role.position != 0);
    }
    roles.sort((a, b) => b.comparePositionTo(a));

    const embeds = [];
    let currentEmbed = new EmbedBuilder()
      .setTitle(`**__Roles list for ${args.member ? args.member.displayName : "this server"}:__**`);
    let currentDescription = "";

    roles.forEach((role) => {
      const roleItem = `${role.position}: ${role}\n`;

      if ((currentDescription + roleItem).length > 2048) {
        currentEmbed.setDescription(currentDescription);
        embeds.push(currentEmbed);

        currentEmbed = new EmbedBuilder();
        currentDescription = "";
      }
      currentDescription += roleItem;
    });

    currentEmbed.setDescription(currentDescription);
    embeds.push(currentEmbed);

    await message.reply({ embeds });
  }
}
