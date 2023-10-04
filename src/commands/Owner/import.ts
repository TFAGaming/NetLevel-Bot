import { ApplicationCommandOptionType } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";
import { fetchMee6Leaderboard, wait } from "../../util/functions";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'import',
        description: 'Import Mee6 XP for this guild.',
        options: [
            {
                name: 'limit',
                description: 'The limit of pages to import.',
                type: ApplicationCommandOptionType.Integer,
                max_value: 50,
                min_value: 1,
                required: true
            },
            {
                name: 'guild',
                description: 'The custom guild ID to import.',
                type: 3,
                required: false
            }
        ],
        dm_permission: false
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        const limit = interaction.options.getInteger('limit', true);
        const guildId = interaction.options.getString('guild') || interaction.guild.id;

        await interaction.deferReply().catch(null);

        try {

            await interaction.followUp({
                content: 'Importing from Mee6 database... (**0%**)\n\nThis command imports 1000 user\'s data from Mee6 database in every 5 seconds, so this might take a while by each page.'
            }).catch(null);

            let page = 0;

            const arr: { messageCount: number, id: string, xp: { userXp: number, levelXp: number, totalXp: number }, level: number, rank: number }[] = [];

            while (true) {
                if (page >= limit) break;

                const res = await fetchMee6Leaderboard(guildId, 'limit=1000&page=' + page);

                const players = res.data?.players;

                if (players.length <= 0) break;

                players.forEach((user: any, index: number) => {
                    const { id, level, message_count: messageCount } = user;
                    const [userXp, levelXp, totalXp] = user.detailed_xp;

                    arr.push({
                        messageCount,
                        id,
                        xp: { userXp, levelXp, totalXp },
                        level,
                        rank: (limit * page) + index + 1
                    });
                });

                page++;

                await interaction.editReply({
                    content: `Importing from Mee6 database... (**${(((page) / limit) * 100).toFixed(1)}%**)\n\nThis command imports 1000 user\'s data from Mee6 database in every 5 seconds, so this might take a while by each page.`
                }).catch(null);    

                await wait(5000);
            };

            await interaction.editReply({
                content: `Successfully imported **${arr.length}** user\'s XP, saving into the database...\n\nThis might take up to 15 minutes, so please wait!`
            }).catch(null); 

            await client.prisma.user.deleteMany({
                where: {
                    guildId: interaction.guild.id
                }
            });

            for (const each of arr) {
                await client.prisma.user.create({
                    data: {
                        guildId: interaction.guild.id,
                        level: each.level,
                        levelXp: each.xp.levelXp,
                        totalXp: each.xp.totalXp,
                        xp: each.xp.userXp,
                        messageCount: each.messageCount,
                        rank: each.rank,
                        userId: each.id
                    }
                });
            };

            await interaction.editReply({
                content: `Successfully saved **${arr.length}** user\'s XP into the database.`
            }).catch(null); 

        } catch (err) {
            await interaction.editReply({
                content: `Unable to import from Mee6 database or save the users XP into the database, please try again.\n\nThis is might caused the error:\n1. Viewing the leaderboard in Mee6 Leaderboard plugin is private (disabled).\n2. The prisma database is full or not well-formatted as SQL.\n3. Database connection error.`
            }).catch(null); 
        };

    }
});