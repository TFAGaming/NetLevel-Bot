import { CommandInteraction, EmbedBuilder } from "discord.js";
import { client } from "..";
import { v4 as uuidv4 } from 'uuid';
import chalk from "chalk";

export class InteractionError {
    constructor(interaction: CommandInteraction, error: any) {
        if (!interaction.deferred) return;

        const id = uuidv4();

        console.log(chalk.red('New error detected, please check the database. UUID: ' + id + ''));

        (async () => {
            const count = await client.prisma.issue.count({
                where: {
                    guildId: interaction.guild?.id as string
                }
            }).catch(null);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error detected')
                        .setDescription(`Something went wrong while executing this command, please report the following ID to the developers to fix this issue as soon as possible.\n\n**UUID**: \`${id}\``)
                        .setFooter({
                            text: 'Issue: #' + ((count + 1) || 0)
                        })
                        .setColor('Red')
                ]
            });

            await client.prisma.issue.create({
                data: {
                    authorId: interaction.user.id,
                    error: `${error}`,
                    guildId: interaction.guild?.id as string,
                    interactionId: interaction.id,
                    uuid: id
                }
            }).catch(null);
        })();
    }
}