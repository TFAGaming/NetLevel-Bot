import { ApplicationCommandOptionType } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'reset',
        description: 'Reset everything for the bot.',
        options: [
            {
                name: 'type',
                description: 'What do you want to reset?',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'All configurations', value: 'config' },
                    { name: 'All levels', value: 'levels' },
                    { name: 'Factory reset', value: 'all' }
                ],
                required: true
            },
            {
                name: 'confirm',
                description: 'This action cannot be done, please make sure before executing the command.',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'Yes, I confirm that I want to reset the following type', value: 'true' }
                ],
                required: false
            }
        ],
        dm_permission: false
    },
    options: {
        guildOwnerOnly: true
    },
    callback: async (client, interaction) => {

        const type = interaction.options.getString('type', true);
        const confirm = interaction.options.getString('confirm') ? true : false;

        if (!interaction.guild) return;

        await interaction.deferReply().catch(null);

        try {

            if (!confirm) {
                await interaction.followUp({
                    content: 'You must confirm that you want to reset the data for your server.\n\n**Important**: Once you accept, all the data will be lost, which means there is no backup for XPs and/or configurations.',
                });

                return;
            };

            if (type === 'levels' || type === 'all') await client.prisma.user.deleteMany({
                where: {
                    guildId: interaction.guild.id
                }
            });

            if (type === 'config' || type === 'all') {
                await client.prisma.guild.deleteMany({
                    where: {
                        guildId: interaction.guild.id
                    }
                });

                await client.prisma.guild.create({
                    data: {
                        guildId: interaction.guild.id
                    }
                });

                await client.prisma.role.deleteMany({
                    where: {
                        guildId: interaction.guild.id,
                    }
                });
            };

            await interaction.followUp({
                content: 'Successfully reset the data for your server.'
            }).catch(null);

        } catch (err) {
            new InteractionError(interaction, err);
        };

    }
});