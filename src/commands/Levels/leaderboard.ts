import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";
import { formatNumber } from "../../util/functions";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'leaderboard',
        description: 'The leaderboard of ranked people.',
        options: [],
        dm_permission: false
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        await interaction.deferReply().catch(null);

        try {
            const data = await client.prisma.user.findMany({
                where: {
                    guildId: interaction.guild.id
                },
                orderBy: [
                    { totalXp: 'desc' }, { level: 'desc' }
                ]
            });

            const mapped = data
                .sort((a, b) => b.level - a.level)
                .sort((a, b) => b.totalXp - a.totalXp)
                .map((each, index) => {
                    const user = client.users.cache.get(each.userId);

                    return `\`#${index + 1}\` ${user ? user.toString() : `<@${each.userId}>`}${user?.id === interaction.user.id ? ' (You)' : ''} - **Total XP**: ${formatNumber(each.totalXp)}, **Level**: ${each.level}`
                })
                .slice(0, 10);

            await interaction.followUp({
                content: `The leaderboard of **${interaction.guild.name}**:\n\n${mapped.join('\n')}\n\nYou are currently at rank **#${data.filter((d) => d.userId === interaction.user.id)?.at(0)?.rank || '?'}**.`,
                allowedMentions: {
                    parse: []
                }
            }).catch(null);
        } catch (err) {
            new InteractionError(interaction, err);
        }

    }
});