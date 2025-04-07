import {
    AutocompleteInteraction,
    Awaitable,
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    UserContextMenuCommandInteraction
} from "discord.js";

export type ChatInputCommandBuilder =
    SlashCommandBuilder |
    Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> |
    SlashCommandSubcommandsOnlyBuilder |
    RESTPostAPIChatInputApplicationCommandsJSONBody;

export interface CommandStructureChatInput<C extends Client, O = {}> {
    type: 1,
    structure: ChatInputCommandBuilder;
    options?: Partial<O>;
    callback: (client: C, interaction: ChatInputCommandInteraction) => Awaitable<void>;
    autocomplete?: (client: C, interaction: AutocompleteInteraction) => Awaitable<void>;
}

export interface CommandStructureUserContext<C extends Client, O = {}> {
    type: 2,
    structure: ContextMenuCommandBuilder | RESTPostAPIContextMenuApplicationCommandsJSONBody;
    options?: Partial<O>;
    callback: (client: C, interaction: UserContextMenuCommandInteraction) => Awaitable<void>;
    autocomplete?: never;
}

export interface CommandStructureMessageContext<C extends Client, O = {}> {
    type: 3,
    structure: ContextMenuCommandBuilder | RESTPostAPIContextMenuApplicationCommandsJSONBody;
    options?: Partial<O>;
    callback: (client: C, interaction: MessageContextMenuCommandInteraction) => Awaitable<void>;
    autocomplete?: never;
}

export type CommandStructure<C extends Client, O = {}> =
    CommandStructureChatInput<C, O> |
    CommandStructureUserContext<C, O> |
    CommandStructureMessageContext<C, O>;

export interface EventStructure<C extends Client, K extends keyof ClientEvents> {
    event: K,
    once?: boolean,
    callback: (client: C, ...args: ClientEvents[K]) => Awaitable<void>
}