import { ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { NetLevelBotCommand } from "../src/class/Builders";
import { getLeaderboardPage } from "../src/util/functions";
import { Rank } from "../src/class/canvas/Rank";
import { InteractionError } from "../src/util/classes";

export default new NetLevelBotCommand({
    type: 1,
    structure: {
        name: 'mee6-rank',
        description: 'Check your rank or someone else\'s rank.',
        options: [
            {
                name: 'user',
                description: 'The user to check their rank.',
                type: ApplicationCommandOptionType.User,
                required: false
            }
        ]
    },
    callback: async (client, interaction) => {

        const user = interaction.options.getUser('user') || interaction.user;

        await interaction.deferReply().catch(null);

        try {
            const member = interaction.guild?.members.cache.get(user.id);

            let pageNumber = 0, page: any[], userInfo: any;

            while (true) {
                page = await getLeaderboardPage(1000, pageNumber);

                userInfo = page.find((u) => u.id === user.id);

                if (page.length < 1000 || userInfo) break;

                pageNumber += 1;
            };

            const rank = new Rank()
                .setAvatar(user.displayAvatarURL())
                .setCurrentXP(userInfo.xp.userXp)
                .setRequiredXP(userInfo.xp.levelXp)
                .setStatus(member?.presence?.status || 'offline')
                .setProgressBar("#FFFFFF", "COLOR")
                .setLevel(userInfo.level)
                .setRank(userInfo.rank)
                .setUsername(user.username);

            if (user.discriminator !== '0') rank.setDiscriminator(user.discriminator);

            rank.build()
                .then(async (data) => {
                    await interaction.followUp({
                        files: [
                            new AttachmentBuilder(data, { name: 'rankcard.png' })
                        ]
                    }).catch(null);
                })
                .catch(async () => {
                    await interaction.editReply({
                        content: 'Failed to generate the rank card, please use text mode instead.'
                    }).catch(null);
                });
        } catch (err: any) {
            new InteractionError(interaction, err);
        };

    }
});