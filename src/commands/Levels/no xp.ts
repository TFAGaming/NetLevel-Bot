import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'no',
        description: 'Disable or enable XP.',
        options: [
            {
                name: 'xp',
                description: 'Disable or enable XP.',
                type: 1,
                options: []
            }
        ],
        dm_permission: false
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        await interaction.deferReply().catch(null);

        try {
            let data = await client.prisma.user.findFirst({
                where: {
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                }
            });

            if (!data) {
                await interaction.followUp({
                    content: `You must send at least one message so I can execute this command properly.`
                }).catch(null);

                return;
            }

            data.noXp = !data.noXp;

            await client.prisma.user.updateMany({
                where: {
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                },
                data: {
                    noXp: data.noXp
                }
            });

            await interaction.followUp({
                content: data.noXp ? `You will not be able to receive XP.` : `You will be able now to receive XP, go grind again!`
            }).catch(null);
        } catch (err) {
            new InteractionError(interaction, err);
        }

    }
});