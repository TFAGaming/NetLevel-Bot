import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'configure',
        description: 'Configure the bot for the server.',
        options: [
            {
                name: 'set',
                description: 'Set/modify the configurations of the levels plugin.',
                type: 1,
                options: [
                    {
                        name: 'configuration',
                        description: 'The configuration to update.',
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: 'Set rank card background image', value: 'rankcard-background' },
                            { name: 'Set rank card level color', value: 'rankcard-levelcolor' },
                            { name: 'Set rank card rank color', value: 'rankcard-rankcolor' },
                            { name: 'Set rank card progress bar color', value: 'rankcard-barcolor' },
                            { name: 'Set XP rate', value: 'xprate' },
                            { name: 'Set level up message channel', value: 'levelupchannel' },
                            { name: 'Set custom level up message', value: 'levelupmessage' },
                            { name: 'Set top ranked user role', value: 'toprankrole' },
                            { name: 'Set stacking roles', value: 'stackingroles' },
                            { name: 'Add role reward', value: 'addrewardrole' },
                            { name: 'Remove role reward', value: 'removerewardrole' },
                            { name: 'Add no XP channel', value: 'addnoxpchannel' },
                            { name: 'Remove no XP channel', value: 'removenoxpchannel' },
                            { name: 'Add no XP role', value: 'addnoxprole' },
                            { name: 'Remove no XP role', value: 'removenoxprole' }
                        ],
                        required: true
                    },
                    { name: 'string', description: 'If the configuration needs a string parameter.', type: ApplicationCommandOptionType.String, required: false },
                    { name: 'integer', description: 'If the configuration needs an integer parameter.', type: ApplicationCommandOptionType.Integer, required: false },
                    { name: 'number', description: 'If the configuration needs a number parameter.', type: ApplicationCommandOptionType.Number, required: false },
                    { name: 'boolean', description: 'If the configuration needs a boolean parameter.', type: ApplicationCommandOptionType.Boolean, required: false },
                    { name: 'role', description: 'If the configuration needs a role parameter.', type: ApplicationCommandOptionType.Role, required: false },
                    { name: 'channel', description: 'If the configuration needs a channel parameter.', type: ApplicationCommandOptionType.Channel, channel_types: [0], required: false },
                    { name: 'attachment', description: 'If the configuration needs an attachment parameter.', type: ApplicationCommandOptionType.Attachment, required: false },
                ]
            },
            {
                name: 'reset',
                description: 'Reset the levels plugin and it\'s configuration.',
                type: 1,
                options: []
            }
        ],
        dm_permission: false
    },
    options: {
        guildOwnerOnly: true
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        const method = interaction.options.getSubcommand() as 'set' | 'reset';

        await interaction.deferReply().catch(null);

        switch (method) {
            case 'set': {
                const configuration = interaction.options.getString('configuration', true);

                const string = interaction.options.getString('string');
                const integer = interaction.options.getInteger('integer');
                const number = interaction.options.getNumber('number');
                const boolean = interaction.options.getBoolean('boolean');
                const role = interaction.options.getRole('role');
                const channel = interaction.options.getChannel('channel');
                const attachment = interaction.options.getAttachment('attachment');

                let data = await client.prisma.guild.findFirst({
                    where: {
                        guildId: interaction.guild.id
                    }
                });

                if (!data) data = await client.prisma.guild.create({
                    data: {
                        guildId: interaction.guild.id
                    }
                });

                try {
                    const reply = async (string: string) => {
                        await interaction.followUp({
                            content: string
                        }).catch(null);
                    }

                    const missingOption = async (...options: string[]) => {
                        await interaction.followUp({
                            content: 'The configuration has missing required option(s): ' + options.map((v) => `**${v}**`).join(', ')
                        }).catch(null);
                    }

                    const save = async () => {
                        await client.prisma.guild.updateMany({
                            where: {
                                guildId: interaction.guild?.id
                            },
                            data: {
                                rankCardBackgroundURL: data?.rankCardBackgroundURL,
                                rankCardLevelColor: data?.rankCardLevelColor,
                                rankCardRankColor: data?.rankCardRankColor,
                                rankCardProgressbarColor: data?.rankCardProgressbarColor,
                                noXpChannels: data?.noXpChannels,
                                noXpRoles: data?.noXpRoles,
                                xpRate: data?.xpRate,
                                levelUpMessage: data?.levelUpMessage,
                                levelUpChannel: data?.levelUpChannel,
                                topRankedRoleId: data?.topRankedRoleId,
                                stackingRoles: data?.stackingRoles
                            }
                        });

                        await interaction.followUp({
                            content: 'Successfully saved the configuration.'
                        }).catch(null);
                    }

                    const regexHexColor = /^#[0-9a-f]{3,6}$/i;

                    switch (configuration) {
                        case 'rankcard-background': {
                            if (!attachment) {
                                await missingOption('Attachment');

                                return;
                            }

                            data.rankCardBackgroundURL = attachment.proxyURL;

                            save();

                            break;
                        }

                        case 'rankcard-levelcolor': {
                            if (!string) {
                                await missingOption('String');

                                return;
                            }

                            if (!regexHexColor.test(string)) {
                                await interaction.followUp({
                                    content: 'Invalid HEX color format.'
                                }).catch(null);

                                return;
                            }

                            data.rankCardLevelColor = string;

                            save();

                            break;
                        }

                        case 'rankcard-rankcolor': {
                            if (!string) {
                                await missingOption('String');

                                return;
                            }

                            if (!regexHexColor.test(string)) {
                                await interaction.followUp({
                                    content: 'Invalid HEX color format.'
                                }).catch(null);

                                return;
                            }

                            data.rankCardRankColor = string;

                            save();

                            break;
                        }

                        case 'rankcard-barcolor': {
                            if (!string) {
                                await missingOption('String');

                                return;
                            }

                            if (!regexHexColor.test(string)) {
                                await interaction.followUp({
                                    content: 'Invalid HEX color format.'
                                }).catch(null);

                                return;
                            }

                            data.rankCardProgressbarColor = string;

                            save();

                            break;
                        }

                        case 'xprate': {
                            if (!number) {
                                await missingOption('Number');

                                return;
                            }

                            if (number < 0.25 || number > 5) {
                                await interaction.followUp({
                                    content: 'Number must be in this following condition: **0.25** ≤ Number ≤ **5**'
                                }).catch(null);

                                return;
                            }

                            data.xpRate = number;

                            save();

                            break;
                        }

                        case 'levelupmessage': {
                            if (!string) {
                                await missingOption('String');

                                return;
                            }

                            data.levelUpMessage = string;

                            save();

                            break;
                        }

                        case 'levelupchannel': {
                            if (!channel) {
                                await missingOption('Channel');

                                return;
                            }

                            data.levelUpChannel = channel.id;

                            save();

                            break;
                        }

                        case 'toprankrole': {
                            if (!role) {
                                await missingOption('Role');

                                return;
                            }

                            data.topRankedRoleId = role.id;

                            save();

                            break;
                        }

                        case 'stackingroles': {
                            if (boolean === null) {
                                await missingOption('Boolean');

                                return;
                            }

                            data.stackingRoles = boolean;

                            save();

                            break;
                        }

                        case 'addrewardrole': {
                            if (!role || !integer) {
                                await missingOption('Role', 'Integer');

                                return;
                            }

                            if (integer <= 0 || integer > 1000) {
                                await reply('Integer must be in this following condition: **0** < Integer ≤ **1000**');

                                return;
                            }

                            const dataRole = await client.prisma.role.findMany({
                                where: {
                                    guildId: interaction.guild.id,
                                    roleId: role.id
                                }
                            });

                            const data = await client.prisma.role.findMany({
                                where: {
                                    guildId: interaction.guild.id
                                }
                            });

                            if (dataRole.length > 0) {
                                await reply(`That role is already added as a reward role.`);

                                return;
                            }

                            const filter = data.some((r) => r.level === integer);

                            if (filter) {
                                await reply(`That level has already a role reward.`)

                                return;
                            }

                            await client.prisma.role.create({
                                data: {
                                    guildId: interaction.guild.id,
                                    roleId: role.id,
                                    level: integer
                                }
                            });

                            save();

                            break;
                        }

                        case 'removerewardrole': {
                            if (!role) {
                                await missingOption('Role');

                                return;
                            }

                            const data = await client.prisma.role.findMany({
                                where: {
                                    guildId: interaction.guild.id,
                                    roleId: role.id
                                }
                            });

                            if (data.length <= 0) {
                                await reply(`That role doesn't exist as a reward role.`);

                                return;
                            }

                            await client.prisma.role.deleteMany({
                                where: {
                                    guildId: interaction.guild.id,
                                    roleId: role.id
                                }
                            });

                            save();

                            break;
                        }

                        case 'addnoxpchannel': {
                            if (!channel) {
                                await missingOption('Channel');

                                return;
                            }

                            if (data.noXpChannels) {
                                const arr = data.noXpChannels.split(',');

                                arr.push(channel.id);

                                data.noXpChannels = arr.join(',');
                            } else {
                                data.noXpChannels = channel.id;
                            }

                            save();

                            break;
                        }

                        case 'removenoxpchannel': {
                            if (!channel) {
                                await missingOption('Channel');

                                return;
                            }

                            if (data.noXpChannels) {
                                let arr = data.noXpChannels.split(',');

                                arr = arr.filter((ch) => ch !== channel.id);

                                data.noXpChannels = arr.length <= 0 ? null : arr.join(',');
                            }

                            save();

                            break;
                        }

                        case 'addnoxprole': {
                            if (!role) {
                                await missingOption('Role');

                                return;
                            }

                            if (data.noXpRoles) {
                                const arr = data.noXpRoles.split(',');

                                arr.push(role.id);

                                data.noXpRoles = arr.join(',');
                            } else {
                                data.noXpRoles = role.id;
                            }

                            save();

                            break;
                        }

                        case 'removenoxprole': {
                            if (!role) {
                                await missingOption('Role');

                                return;
                            }

                            if (data.noXpRoles) {
                                let arr = data.noXpRoles.split(',');

                                arr = arr.filter((ch) => ch !== role.id);

                                data.noXpRoles = arr.length <= 0 ? null : arr.join(',');
                            }

                            save();

                            break;
                        }
                    }

                } catch (err) {
                    new InteractionError(interaction, err);
                }

                break;
            }

            case 'reset': {
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
                    content: 'Are you sure that you want to reset the configuration data by default?',
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

                        await client.prisma.guild.updateMany({
                            where: {
                                guildId: interaction.guild?.id
                            },
                            data: {
                                rankCardBackgroundURL: null,
                                rankCardLevelColor: null,
                                rankCardRankColor: null,
                                rankCardProgressbarColor: null,
                                noXpChannels: null,
                                noXpRoles: null,
                                xpRate: null,
                                levelUpMessage: null,
                                levelUpChannel: null
                            }
                        });

                        await client.prisma.role.deleteMany({
                            where: {
                                guildId: interaction.guild?.id,
                            }
                        });

                        await i.editReply({
                            content: 'The configuration has been reset by default.'
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

                break;
            }
        }

    }
});