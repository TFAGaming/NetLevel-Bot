import { NetLevelBotCommand } from "../../class/Builders";
import { InteractionError } from "../../util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'ping',
        description: 'Replies with Pong!',
        options: [],
        dm_permission: false
    },
    callback: async (client, interaction) => {

        if (!interaction.guild) return;

        try {

            const dateBefore = Date.now();

            await interaction.deferReply().catch(null);

            const dateAfter = Date.now();

            await interaction.followUp({
                content: `🏓 **Pong!**\nWebsocket latency: \`${client.ws.ping}ms\`\nDeferred interaction: \`${dateAfter - dateBefore}ms\``
            }).catch(null);

        } catch (err) {
            new InteractionError(interaction, err);
        }

    }
});