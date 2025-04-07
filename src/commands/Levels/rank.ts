import { ApplicationCommandOptionType, AttachmentBuilder } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { Rank } from "../../class/canvas/Rank";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'rank',
        description: 'Check your rank or someone else\'s rank.',
        options: [
            {
                name: 'user',
                description: 'The user to check their rank.',
                type: ApplicationCommandOptionType.User,
                required: false
            }
        ],
        dm_permission: false
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        const user = interaction.options.getUser('user') || interaction.user;

        await interaction.deferReply().catch(null);

        try {
            const data = await client.prisma.user.findFirst({
                where: {
                    guildId: interaction.guild.id,
                    userId: user.id
                }
            });

            const guildData = await client.prisma.guild.findFirst({
                where: {
                    guildId: interaction.guild.id
                }
            });

            if (!data) {
                if (user.id === interaction.user.id) {
                    await interaction.followUp({
                        content: 'You are currently at level **0**.',
                    });
                } else if (user.bot) {
                    await interaction.followUp({
                        content: user.toString() + ' is a bot.'
                    });
                } else {
                    await interaction.followUp({
                        content: user.toString() + ' is currently at level **0**.',
                        allowedMentions: {
                            parse: []
                        }
                    });
                }

                return;
            }

            const member = interaction.guild?.members.cache.get(user.id);

            const rank = new Rank()
                .setAvatar(user.displayAvatarURL())
                .setCurrentXP(data.xp)
                .setRequiredXP(data.levelXp)
                .setStatus(member?.presence?.status || 'offline')
                .setProgressBar(guildData?.rankCardProgressbarColor || "#FFFFFF", "COLOR")
                .setLevel(data.level)
                .setRank(data.rank)
                .setUsername(user.username);

            if (user.discriminator !== '0') rank.setDiscriminator(user.discriminator);

            if (guildData?.rankCardBackgroundURL) rank.setBackground('IMAGE', guildData?.rankCardBackgroundURL);
            if (guildData?.rankCardRankColor) rank.setRankColor(guildData?.rankCardRankColor);
            if (guildData?.rankCardLevelColor) rank.setLevelColor(guildData?.rankCardLevelColor);

            rank.build({ fontX: 'Inconsolata', fontY: 'Inconsolata' })
                .then(async (data) => {
                    await interaction.followUp({
                        files: [
                            new AttachmentBuilder(data, { name: 'rankcard.png' })
                        ]
                    }).catch(null);
                })
                .catch(async () => {
                    await interaction.editReply({
                        content: 'Failed to generate the rank card, please use text mode instead.'
                    }).catch(null);
                });
        } catch (err) {
            new InteractionError(interaction, err);
        }
    }
});