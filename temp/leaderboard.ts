import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Role } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import config from "../../config";
import { axiosFetch, formatNumber } from "../../util/functions";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'mee6-leaderboard',
        description: 'Check all the level rewards from Mee6 on ' + config.guild.name + '.',
        options: []
    },
    callback: async (client, interaction) => {

        await interaction.deferReply().catch(null);

        try {
            const res = await axiosFetch('limit=10');

            const mapped = (res.data?.players as any[]).map((v, index) => {
                const user = client.users.cache.get(v.id);

                return `\`#${index + 1}\` ${user ? user.toString() : v.username} - **XP**: ${formatNumber(v.xp)}, **Level**: ${v.level}`
            });

            await interaction.followUp({
                content: `The leaderboard of **${config.guild.name}**:\n\n${mapped.join('\n')}`,
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setURL(res.data?.guild?.leaderboard_url)
                                .setLabel('Leaderboard URL')
                                .setStyle(ButtonStyle.Link)
                        )
                ],
                allowedMentions: {
                    parse: []
                }
            }).catch(null);
        } catch (err: any) {
            new InteractionError(interaction, err);
        };

    }
});