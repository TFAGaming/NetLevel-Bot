import { ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { NetLevelBotCommand } from "../src/class/Builders";
import { formatNumber, getLeaderboardPage, stringProgressBar, time } from "../src/util/functions";
import { InteractionError } from "../src/util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'mee6-info',
        description: 'Get information of your leveling XP.',
        options: [
            {
                name: 'user',
                description: 'The user to check their rank.',
                type: ApplicationCommandOptionType.User,
                required: false
            }
        ]
    },
    callback: async (client, interaction) => {

        const user = interaction.options.getUser('user') || interaction.user;

        await interaction.deferReply().catch(null);

        try {
            let pageNumber = 0, page: any[], userInfo: any;

            while (true) {
                page = await getLeaderboardPage(1000, pageNumber);

                userInfo = page.find((u) => u.id === user.id);

                if (page.length < 1000 || userInfo) break;

                pageNumber += 1;
            };
            
            const [progressString] = stringProgressBar(userInfo.xp.levelXp, userInfo.xp.userXp);

            const remainingXP = userInfo.xp.levelXp - userInfo.xp.userXp;
            const xpPerMessage = userInfo.xp.totalXp / userInfo.messageCount;
            const messagesNeeded = Math.ceil(remainingXP / xpPerMessage);
            const timeNeeded = messagesNeeded * 60000;

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Level: ${userInfo.level} | Rank: #${userInfo.rank}`)
                        .setAuthor({
                            name: user.username,
                            iconURL: user.displayAvatarURL()
                        })
                        .setThumbnail(interaction.guild?.iconURL() || null)
                        .setDescription(`**Total messages**: ${userInfo.messageCount} (${formatNumber(userInfo.messageCount)})\n**Total XP**: ${userInfo.xp.totalXp} (${formatNumber(userInfo.xp.totalXp)})\n**Current XP**: ${userInfo.xp.userXp} (${formatNumber(userInfo.xp.userXp)})\n**Required XP for Level ${userInfo.level + 1}**: ${userInfo.xp.levelXp} (${formatNumber(userInfo.xp.levelXp)})\n\n${progressString}`)
                        .addFields(
                            { name: 'Remaining XP', value: `${remainingXP} (${formatNumber(remainingXP)})** **`, inline: true },
                            { name: 'Remaining messages', value: `${messagesNeeded} (${formatNumber(messagesNeeded)})** **`, inline: true },
                            { name: 'XP per message', value: `${xpPerMessage.toFixed(1) || 15}** **`, inline: true },
                            { name: `Earliest possible time to reach Level ${userInfo.level + 1}`, value: `${time(Date.now() + timeNeeded, 'f')} (${time(Date.now() + timeNeeded, 'R')})`, inline: true },
                        )
                        .setColor('Blurple')
                ]
            }).catch(null);

        } catch (err: any) {
            new InteractionError(interaction, err);
        };

    }
});