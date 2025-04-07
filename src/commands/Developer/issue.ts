import { AttachmentBuilder } from "discord.js";
import { NetLevelBotCommand } from "../../class/Builders";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'issue',
        description: 'Issues database',
        options: [
            {
                name: 'get',
                description: 'Get an issue\'s data.',
                type: 1,
                options: [
                    {
                        name: 'uuid',
                        description: 'The UUID of the issue.',
                        type: 3,
                        required: true
                    }
                ]
            },
            {
                name: 'delete',
                description: 'Delete an issue.',
                type: 1,
                options: [
                    {
                        name: 'uuid',
                        description: 'The UUID of the issue.',
                        type: 3,
                        required: true
                    }
                ]
            },
            {
                name: 'purge',
                description: 'Delete all issues.',
                type: 1,
                options: []
            }
        ],
        dm_permission: false
    },
    options: {
        developersOnly: true
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        await interaction.deferReply().catch(null);

        try {
            switch (interaction.options.getSubcommand()) {
                case 'get': {
                    const uuid = interaction.options.getString('uuid', true);

                    const data = await client.prisma.issue.findFirst({
                        where: {
                            guildId: interaction.guild.id,
                            uuid: uuid
                        }
                    });

                    if (!data) {
                        await interaction.followUp({
                            content: 'Invalid UUID provided.'
                        }).catch(null);

                        return;
                    }

                    await interaction.followUp({
                        content: `**UUID**: ${data.uuid}\n**Author**: <@${data.authorId}>\n**Issue ID**: ${data.id}\n**Error**:`,
                        files: [
                            new AttachmentBuilder(
                                Buffer.from(`${data.error}`, 'utf-8'), { name: 'error.txt' }
                            )
                        ],
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(null);

                    break;
                }

                case 'delete': {
                    const uuid = interaction.options.getString('uuid', true);

                    const data = await client.prisma.issue.findFirst({
                        where: {
                            guildId: interaction.guild.id,
                            uuid: uuid
                        }
                    });

                    if (!data) {
                        await interaction.followUp({
                            content: 'Invalid UUID provided.'
                        }).catch(null);

                        return;
                    }

                    await client.prisma.issue.deleteMany({
                        where: {
                            guildId: interaction.guild.id,
                            uuid: uuid
                        }
                    });

                    await interaction.followUp({
                        content: `Issue **#${data.id}** has been successfully deleted.`,
                    }).catch(null);

                    break;
                }

                case 'purge': {
                    await client.prisma.issue.deleteMany({
                        where: {
                            guildId: interaction.guild.id
                        }
                    });

                    await interaction.followUp({
                        content: `Successfully deleted all the issues.`,
                    }).catch(null);

                    break;
                }
            }
        } catch (err) {
            console.error(err); // ← Issues shouldn't be saved from developers commands.
        }

    }
});