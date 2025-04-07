import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { formatNumber, stringProgressBar, time } from "../../util/functions";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'info',
        description: 'Get information of your leveling XP.',
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
            if (user.bot) {
                await interaction.followUp({
                    content: user.toString() + ' is a bot.'
                }).catch(null);

                return;
            }

            const data = await client.prisma.user.findFirst({
                where: {
                    guildId: interaction.guild.id,
                    userId: user.id
                }
            });

            if (!data) {
                await interaction.followUp({
                    content: (user.id === interaction.user.id ? 'You are ' : `${user.toString()} is `) + 'currently at level **0**.',
                    allowedMentions: {
                        parse: []
                    }
                });

                return;
            }

            const [progressString] = stringProgressBar(data.levelXp, data.xp);

            const remainingXP = data.levelXp - data.xp;
            const xpPerMessage = data.totalXp / data.messageCount;
            const messagesNeeded = Math.ceil(remainingXP / xpPerMessage);
            const timeNeeded = messagesNeeded * 60000;

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Level: ${data.level} | Rank: #${data.rank}`)
                        .setAuthor({
                            name: user.username,
                            iconURL: user.displayAvatarURL()
                        })
                        .setThumbnail(interaction.guild?.iconURL() || null)
                        .setDescription(`**Total messages**: ${data.messageCount} (${formatNumber(data.messageCount)})\n**Total XP**: ${data.totalXp} (${formatNumber(data.totalXp)})\n**Current XP**: ${data.xp} (${formatNumber(data.xp)})\n**Required XP for Level ${data.level + 1}**: ${data.levelXp} (${formatNumber(data.levelXp)})\n\n${progressString}`)
                        .addFields(
                            { name: 'Remaining XP', value: `${remainingXP} (${formatNumber(remainingXP)})** **`, inline: true },
                            { name: 'Remaining messages', value: `${messagesNeeded} (${formatNumber(messagesNeeded)})** **`, inline: true },
                            { name: 'XP per message', value: `${xpPerMessage.toFixed(1) || 15}** **`, inline: true },
                            { name: `Earliest possible time to reach Level ${data.level + 1}`, value: `${time(Date.now() + timeNeeded, 'f')} (${time(Date.now() + timeNeeded, 'R')})`, inline: true },
                        )
                        .setColor('Blurple')
                ]
            }).catch(null);

        } catch (err: any) {
            new InteractionError(interaction, err);
        }

    }
});