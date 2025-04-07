import { Guild, TextChannel } from "discord.js";
import { GatewayEventListener } from "../../class/Builders";
import { ExtendedClient } from "../../class/ExtendedClient";

const levelingConfig = {
    xpPerMessage: (min: number, max: number) => {
        return Math.random() * (max - min) + min;
    },
    xpRate: 1.0
}

const antispam = new Map<string, number>();

export default new GatewayEventListener({
    event: 'messageCreate',
    callback: async (client, message) => {

        if (!message.guild || message.author.bot) return;

        const checkspam = antispam.get(message.author.id);

        if (checkspam && checkspam > Date.now()) return;

        if (message.content.length < 3) return;

        antispam.delete(message.author.id);

        antispam.set(message.author.id, Date.now() + 500);

        const guild = await client.prisma.guild.findFirst({
            where: {
                guildId: message.guild.id
            }
        });

        if (guild?.noXpChannels?.split(',')?.includes(message.channel.id)) {
            return;
        }

        if (guild?.noXpRoles?.split(',')?.some((role) => message.member?.roles.cache.has(role))) {
            return;
        }

        const data = await client.prisma.user.findFirst({
            where: {
                guildId: message.guild.id,
                userId: message.author.id
            }
        });

        if (data?.noXp === true) return;

        if (!data) {
            const count = await client.prisma.user.count({
                where: {
                    guildId: message.guild.id
                }
            });

            await client.prisma.user.create({
                data: {
                    guildId: message.guild.id,
                    userId: message.author.id,
                    messageCount: 1,
                    level: 0,
                    rank: count + 1,
                    levelXp: 0,
                    xp: 0,
                    totalXp: 0,
                    noXp: false
                }
            });

            setTimeout(() => {
                antispam.delete(message.author.id);
            }, 2000);

            return;
        }

        const calculated = await calculateUserLevel(data.level, data.xp);
        const xpPerMessage = levelingConfig.xpPerMessage(15, 25) * (guild?.xpRate ? guild.xpRate : levelingConfig.xpRate);
        const xpToAssign = xpPerMessage + data.xp;

        console.log('');

        console.log(xpPerMessage);
        console.log(xpToAssign);
        console.log(data);

        if (calculated.lvl > data.level) {
            const levelupchannel = message.guild.channels.cache.get(guild?.levelUpChannel ?? '') as TextChannel;

            await (levelupchannel ? levelupchannel : message.channel).send({
                content: guild?.levelUpMessage
                    ? guild.levelUpMessage
                        .replace(/{user}/g, message.author.toString())
                        .replace(/{userId}/g, message.author.id)
                        .replace(/{username}/g, message.author.username)
                        .replace(/{level}/g, calculated.lvl.toString())
                    : `🎉 Congratulations ${message.author.toString()}, you're now at **level ${calculated.lvl}**!`
            }).catch(null);

            await client.prisma.user.updateMany({
                where: {
                    id: data.id,
                    guildId: message.guild.id,
                    userId: message.author.id
                },
                data: {
                    level: calculated.lvl,
                    messageCount: data.messageCount + 1,
                    xp: 1,
                    levelXp: calculated.requiredXp
                }
            });

            await checkRoleRewards(client, message.guild.id, message.author.id, calculated.lvl, guild?.stackingRoles ? true : false);

            return;
        }

        await client.prisma.user.updateMany({
            where: {
                id: data.id,
                guildId: message.guild.id,
                userId: message.author.id
            },
            data: {
                level: calculated.lvl,
                messageCount: data.messageCount + 1,
                xp: xpToAssign,
                totalXp: data.totalXp + xpPerMessage,
                levelXp: calculated.requiredXp
            }
        });

    }
});

const calculateUserLevel = async (lvl: number, xp: number): Promise<{ lvl: number, requiredXp: number }> => {
    const base = 5;
    const xpCoefficient = 50;
    const constant = 100;

    const requiredXP = base * (lvl ** 2) + xpCoefficient * lvl + constant;

    if (xp >= requiredXP) {
        return {
            lvl: lvl + 1,
            requiredXp: requiredXP
        }
    } else {
        return {
            lvl: lvl,
            requiredXp: requiredXP
        }
    }
}

const checkRoleRewards = async (client: ExtendedClient, guildId: string, userId: string, newLevel: number, stacking?: boolean) => {
    const roleRewards = await client.prisma.role.findMany({
        where: {
            guildId: guildId
        }
    });

    const data = await client.prisma.user.findFirst({
        where: {
            guildId: guildId,
            userId: userId
        }
    });

    if (!roleRewards || roleRewards.length <= 0 || !data) return;

    const guild = client.guilds.cache.get(guildId);

    const member = guild?.members.cache.get(userId);

    if (!member || !guild) return;

    const reward = roleRewards.filter((reward) => reward.guildId === guildId && reward.level === newLevel)[0];

    if (reward) {
        const oldRoleGiven = guild.roles.cache.get(data?.lastRoleIdGiven ?? '');

        if (oldRoleGiven && !stacking) {
            await member.roles.remove(oldRoleGiven.id).catch(null);
        }

        await member.roles.add(reward.roleId).catch(null);

        await client.prisma.user.updateMany({
            where: {
                guildId: guildId,
                userId: userId
            },
            data: {
                lastRoleIdGiven: reward.roleId
            }
        });
    }
}