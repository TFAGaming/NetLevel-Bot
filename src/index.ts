import { config } from 'dotenv'
import { ExtendedClient } from './class/ExtendedClient'

config();

export const client: ExtendedClient = new ExtendedClient();

client.start();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);