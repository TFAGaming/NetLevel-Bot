import { ApplicationCommandOptionType } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'remove',
        description: 'Remove XP',
        options: [
            {
                name: 'xp',
                description: 'Remove an amount of XP from a user.',
                type: 1,
                options: [
                    {
                        name: 'user',
                        description: 'The user to remove XP.',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'amount',
                        description: 'The amount of XP to remove.',
                        type: ApplicationCommandOptionType.Integer,
                        min_value: 1,
                        max_value: 100000000,
                        required: true
                    }
                ]
            }
        ],
        dm_permission: false
    },
    options: {
        guildOwnerOnly: true
    },
    callback: async (client, interaction) => {

        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        if (!interaction.guild) return;

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
                    content: 'The user must send at least one message in any channel.'
                }).catch(null);

                return;
            }

            const newTotalXP = Math.max(data.totalXp - amount, 0);

            let newLevel = data.level;
            let requiredXP = data.levelXp;

            while (newTotalXP < requiredXP) {
                newLevel--;
                requiredXP = 5 * (newLevel ** 2) + 50 * newLevel + 100;
            }

            const remainingXP = requiredXP - newTotalXP;

            await client.prisma.user.updateMany({
                where: {
                    guildId: interaction.guild.id,
                    userId: user.id
                },
                data: {
                    xp: Math.max(remainingXP, 0),
                    totalXp: Math.max(newTotalXP, 0),
                    level: Math.max(newLevel, 0),
                    levelXp: Math.max(requiredXP, 0)
                }
            });

            await interaction.followUp({
                content: `Successfully removed **${amount}** XP from ${user.toString()}, now they're at level **${Math.max(newLevel, 0)}**.`
            }).catch(null);

        } catch (err) {
            new InteractionError(interaction, err);
        }

    }
});