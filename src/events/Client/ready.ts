import { GatewayEventListener } from "../../class/Builders";

export default new GatewayEventListener({
    event: 'ready',
    callback: async (_client, client) => {

        console.log('Logged in as: ' + client.user.username);

        setInterval(() => {
            try {
                client.guilds.cache.forEach(async (guild) => {
                    const data = await _client.prisma.guild.findFirst({
                        where: {
                            guildId: guild.id
                        }
                    });

                    const users = await _client.prisma.user.findMany({
                        where: {
                            guildId: guild.id
                        },
                        orderBy: [
                            { totalXp: 'desc' }, { level: 'desc' }
                        ]
                    });

                    let rank = 1;

                    for (const user of users) {
                        await _client.prisma.user.updateMany({
                            where: {
                                id: user.id,
                                guildId: guild.id,
                                userId: user.userId
                            },
                            data: {
                                rank: rank
                            }
                        });

                        if (rank <= 1 && data?.topRankedRoleId) {
                            await guild.members.cache.get(user.userId)?.roles?.add(data.topRankedRoleId).catch(null);
                        }

                        rank++;
                    }

                });

                console.log('Ranks has been updated.');
            } catch {
                console.warn('Failed to update ranks.');
            }
        }, 30000);

        client.guilds.cache.forEach(async (guild) => {
            try {
                const data = await _client.prisma.guild.findFirst({
                    where: {
                        guildId: guild.id
                    }
                });

                if (!data) await _client.prisma.guild.create({
                    data: {
                        guildId: guild.id
                    }
                });
            } catch { }
        });

    }
});