import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'factory',
        description: 'Factory reset',
        options: [
            {
                name: 'reset',
                description: 'Reset the bot by default, everything will be erased.',
                type: 1
            }
        ],
        dm_permission: false
    },
    options: {
        guildOwnerOnly: true
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        await interaction.deferReply().catch(null);

        try {
            const buttons = [
                new ButtonBuilder()
                    .setCustomId('yes-' + interaction.id)
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('Yes'),
                new ButtonBuilder()
                    .setCustomId('no-' + interaction.id)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel('No'),
            ];

            await interaction.editReply({
                content: 'Are you sure that you want to reset the bot by default for this server? This command will erase everything, including the server configuration and users XP.',
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            buttons
                        )
                ]
            }).catch(null);

            const collector = interaction.channel?.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 15000
            });

            collector?.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({
                        content: 'You are not the author of this interaction.',
                        ephemeral: true
                    }).catch(null);

                    return;
                }

                const split = i.customId.split('-');

                if (split[1] !== interaction.id) return;

                if (split[0] === 'yes') {
                    collector.stop();

                    await i.deferReply();

                    await client.prisma.user.deleteMany({
                        where: {
                            guildId: interaction.guild?.id as string
                        }
                    });
                    await client.prisma.guild.deleteMany({
                        where: {
                            guildId: interaction.guild?.id as string
                        }
                    });

                    await client.prisma.guild.create({
                        data: {
                            guildId: interaction.guild?.id as string
                        }
                    });

                    await client.prisma.role.deleteMany({
                        where: {
                            guildId: interaction.guild?.id as string
                        }
                    });

                    await i.editReply({
                        content: 'The bot has been reset by default for the server.'
                    }).catch(null);

                } else if (split[0] === 'no') {
                    collector.stop();

                    await i.reply({
                        content: 'The request has been cancelled.'
                    }).catch(null);
                }
            });

            collector?.on('end', async () => {
                await interaction.editReply({
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                buttons.map((button) =>
                                    button
                                        .setStyle(ButtonStyle.Secondary)
                                        .setDisabled(true)
                                )
                            )
                    ]
                }).catch(null);
            });

        } catch (err) {
            new InteractionError(interaction, err);
        }

    }
});