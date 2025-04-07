import { Client, GatewayIntentBits, Collection, Partials, REST, Routes, ClientEvents } from "discord.js";
import { CommandOptions } from "./Builders";
import { readdirSync } from 'fs';
import { CommandStructure, EventStructure } from "../types";
import { PrismaClient } from "@prisma/client";

export class ExtendedClient extends Client {
    public commands: Collection<string, CommandStructure<ExtendedClient, CommandOptions>> = new Collection();
    public categories: Collection<string, string[]> = new Collection();
    public prisma = new PrismaClient();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.GuildMember,
                Partials.User
            ],
            presence: {
                activities: [{
                    name: '/help for help!'
                }],
                status: 'online'
            }
        });
    }

    public async load() {
        for (let dir of readdirSync('./dist/commands/')) {
            this.categories.set(dir, []);

            for (let file of readdirSync('./dist/commands/' + dir + '/').filter((f) => f.endsWith('.js'))) {
                const module: CommandStructure<ExtendedClient, CommandOptions> = require('../commands/' + dir + '/' + file).default;

                this.commands.set(module.structure.name, module);

                const data = this.categories.get(dir);

                if (data) {
                    data.push(module.structure.name);
                    this.categories.set(dir, data);
                }

                console.log('Loaded new command: ' + file);
            }
        }

        for (let dir of readdirSync('./dist/events/')) {
            for (let file of readdirSync('./dist/events/' + dir + '/').filter((f) => f.endsWith('.js'))) {
                const module: EventStructure<any, keyof ClientEvents> = require('../events/' + dir + '/' + file).default;

                if (module.once) {
                    this.once(module.event, (...args) => module.callback(this, ...args));
                } else {
                    this.on(module.event, (...args) => module.callback(this, ...args));
                }

                console.log('Loaded new event: ' + file);
            }
        }
    }

    public async deploy() {
        try {
            const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

            const commands = [...this.commands.values()];

            console.log('Loading application commands...');

            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
                body: commands.map((s) => s.structure)
            });

            console.log('Loaded application commands.');
        } catch {
            console.log('Unable to load application commands.');
        }
    }

    public async start() {
        this.load();
        await this.login(process.env.CLIENT_TOKEN);
        await this.deploy();


    }
}