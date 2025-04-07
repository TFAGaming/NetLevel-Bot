import { ActionRowBuilder, ComponentType, StringSelectMenuBuilder } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'help',
        description: 'Show all commands information.',
        options: [],
        dm_permission: false
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        await interaction.deferReply().catch(null);

        try {
            const commandsFetched = await client.application?.commands?.fetch();

            const commands: { name: string, id: string, suboption?: string, otheroption?: string, description: string }[] = [];

            commandsFetched?.forEach((cmd) => {
                if (cmd.type === 1) {
                    if (cmd.options && cmd.options?.length > 0) {
                        for (const option of cmd.options) {
                            if ((option as any).type === 2 && (option as any)?.options) {
                                for (const option2 of (option as any)?.options) {
                                    commands.push({
                                        name: cmd.name,
                                        id: cmd.id,
                                        suboption: option.name,
                                        otheroption: option2.name,
                                        description: option2.description
                                    });
                                }
                            } else if (option.type === 1) {
                                commands.push({
                                    name: cmd.name,
                                    id: cmd.id,
                                    suboption: option.name,
                                    description: option.description
                                });
                            } else {
                                commands.push({
                                    name: cmd.name,
                                    id: cmd.id,
                                    description: cmd.description
                                });

                                break;
                            }
                        }
                    } else {
                        commands.push({
                            name: cmd.name,
                            id: cmd.id,
                            description: cmd.description
                        });
                    }
                }
            });

            const keys = [...client.categories.keys()];
            const final: { cat: string, message: string }[] = [];

            keys.forEach((key) => {
                const toAdd: { cat: string, values: string[] } = { cat: key, values: [] }
                const data = client.categories.get(key);

                commands.forEach((cmd) => {
                    if (data?.some((v) => v === cmd.name)) {
                        toAdd.values.push(`</${cmd.name}${cmd.suboption ? ` ${cmd.suboption}` : ''}${cmd.otheroption ? ` ${cmd.otheroption}` : ''}:${cmd.id}>: ${cmd.description}`)
                    }
                });

                final.push({
                    cat: toAdd.cat,
                    message: `**${toAdd.cat} commands:**\n\n${toAdd.values.join('\n')}`
                });
            });

            const collector = interaction.channel?.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000 * 3
            });

            const components = [
                new StringSelectMenuBuilder()
                    .setCustomId('help-' + interaction.id)
                    .setPlaceholder('Select a module')
                    .addOptions(
                        client.categories.map((_, key) => {
                            return {
                                label: key,
                                value: key
                            }
                        })
                    )
            ];

            await interaction.followUp({
                content: 'Select a module from the select menu below.',
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(
                            components[0]
                        )
                ]
            });

            collector?.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({
                        content: 'You are not the author of this interaction.',
                        ephemeral: true
                    }).catch(null);

                    return;
                }

                if (i.customId !== `help-${interaction.id}`) return;

                const value = i.values[0];

                await i.update({
                    content: final.filter((v) => v.cat === value).map((v) => v.message)[0]
                }).catch(null);
            });

            collector?.on('end', async () => {
                await interaction.editReply({
                    content: 'The command has been expired after 3 minutes of timeout.',
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                components[0].setDisabled(true)
                            )
                    ]
                }).catch(null);
            });
        } catch (err) {
            new InteractionError(interaction, err);
        }

    }
});