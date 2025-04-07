import { GuildMember } from "discord.js";
import { GatewayEventListener } from "../../class/Builders";
import config from "../../config";

export default new GatewayEventListener({
    event: 'interactionCreate',
    callback: async (client, interaction) => {

        if (!interaction.guild) return;
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            const { options } = command;

            if (options) {
                if (options.developersOnly && !config.developers.includes(interaction.user.id)) {
                    await interaction.reply({
                        content: 'You are not a part of the developers of **' + client.user?.username + '**.',
                        ephemeral: true
                    });

                    return;
                }

                if (options.mainDeveloperOnly && interaction.user.id !== config.ownerId) {
                    await interaction.reply({
                        content: 'You are not the maintainer of **' + client.user?.username + '**.',
                        ephemeral: true
                    });

                    return;
                }

                if (options.guildOwnerOnly && interaction.user.id !== interaction.guild.ownerId) {
                    await interaction.reply({
                        content: 'The command is only accessible to the guild owner.',
                        ephemeral: true
                    });

                    return;
                }

                if (options.channelsOnly && interaction.user.id !== config.ownerId && !options.channelsOnly.includes(interaction.channel?.id || '')) {
                    const mentionedChannels: string[] = [];

                    for (const channelId of options.channelsOnly) {
                        const channel = client.channels.cache.get(channelId);

                        if (channel) mentionedChannels.push('<#' + channelId + '>');
                    }

                    await interaction.reply({
                        content: `This command can be executed only in the following channels:\n${mentionedChannels.join(', ')}`,
                        ephemeral: true
                    });

                    return;
                }

                if (options.rolesOnly && interaction.user.id !== config.ownerId) {
                    const member = interaction.guild.members.cache.get(interaction.user.id) as GuildMember;

                    const memberRoleIds = member.roles.cache.map((role) => role.id);

                    if (!options.rolesOnly.some((roleId) => memberRoleIds.includes(roleId))) {
                        const mentionedRoles: string[] = [];

                        for (const roleId of options.rolesOnly) {
                            const role = interaction.guild.roles.cache.get(roleId);

                            if (role) mentionedRoles.push('<@&' + roleId + '>');
                        }

                        await interaction.reply({
                            content: `This command can be executed only if you have one of the following roles:\n${mentionedRoles.join(', ')}`,
                            ephemeral: true
                        });
                    }

                    return;
                }
            }

            if (interaction.isChatInputCommand() && command.type === 1) return command.callback(client, interaction);
            if (interaction.isUserContextMenuCommand() && command.type === 2) return command.callback(client, interaction);
            if (interaction.isMessageContextMenuCommand() && command.type === 3) return command.callback(client, interaction);
        } catch (err) {
            console.error(err);
        }

    }
});