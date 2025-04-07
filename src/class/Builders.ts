import {
    Client,
    ClientEvents
} from "discord.js";
import { ExtendedClient } from "./ExtendedClient";
import { CommandStructure, EventStructure } from "../types";

export type CommandOptions = {
    developersOnly: boolean,
    mainDeveloperOnly: boolean,
    ownerOnly: boolean,
    channelsOnly: string[],
    rolesOnly: string[],
    slowmode: number,
    guildOwnerOnly: boolean
}

export class NetLevelBotCommand<C extends Client = ExtendedClient, O = CommandOptions> {
    public data: CommandStructure<C, O>;
    public readonly type: CommandStructure<C, O>['type'];
    public readonly structure: CommandStructure<C, O>['structure'];
    public readonly options?: Partial<CommandStructure<C, O>['options']>;
    public readonly callback: CommandStructure<C, O>['callback'];
    public readonly autocomplete?: CommandStructure<C, O>['autocomplete'];

    constructor(data: CommandStructure<C, O>) {
        this.type = data.type;
        this.structure = data.structure;
        this.options = data.options;
        this.callback = data.callback;
        this.autocomplete = data.autocomplete;

        this.data = data;
    }

    public toJSON(): CommandStructure<C, O> {
        return { ...this.data }
    }
}

export class GatewayEventListener<C extends Client = ExtendedClient, K extends keyof ClientEvents = keyof ClientEvents> {
    public data: EventStructure<C, K>;
    public readonly event: EventStructure<C, K>['event'];
    public readonly once?: EventStructure<C, K>['once'];
    public readonly callback: EventStructure<C, K>['callback'];

    constructor(data: EventStructure<C, K>) {
        this.event = data.event;
        this.once = data.once;
        this.callback = data.callback;

        this.data = data;
    }

    public toJSON(): EventStructure<C, K> {
        return { ...this.data }
    }
}