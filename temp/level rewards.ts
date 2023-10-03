import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Role } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import config from "../../config";
import { InteractionError } from "../../util/classes";
import { axiosFetch } from "../../util/functions";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'mee6-level',
        description: 'a command',
        options: [
            {
                name: 'rewards',
                description: 'Check all the level rewards from Mee6 on ' + config.guild.name + '.',
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },
    callback: async (client, interaction) => {

        await interaction.deferReply().catch(null);

        try {
            const res = await axiosFetch('limit=1');

            const mapped = (res.data?.role_rewards as { rank: number, role: Role }[]).map((v) => `**Level ${v.rank}**: ${v.role.name}`)

            await interaction.followUp({
                content: `Here are the level rewards, start grinding now to reach a new level!\n\n${mapped.join('\n')}`,
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