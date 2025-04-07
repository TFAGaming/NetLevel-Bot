import axios from "axios";
import config from "../config";
import { TimestampStylesString } from "discord.js";

export const formatNumber = (num: number, precision: number = 1) => {
    const map = [
        { suffix: 'T', threshold: 1e12 },
        { suffix: 'B', threshold: 1e9 },
        { suffix: 'M', threshold: 1e6 },
        { suffix: 'k', threshold: 1e3 },
        { suffix: '', threshold: 1 },
    ];

    const found = map.find((x) => Math.abs(num) >= x.threshold);

    if (found) {
        const formatted = (num / found.threshold).toFixed(precision) + found.suffix;

        return formatted;
    }

    return num.toString();
}

export const stringProgressBar = (total: number, current: number, size: number = 20, line: string = '▬', slider: string = '🔘') => {
    if (current > total) {
        const bar = line.repeat(size + 2);
        const percentage = (current / total) * 100;

        return [bar, percentage];
    } else {
        const percentage = current / total;
        const progress = Math.round((size * percentage));
        const emptyProgress = size - progress;
        const progressText = line.repeat(progress).replace(/.$/, slider);
        const emptyProgressText = line.repeat(emptyProgress);
        const bar = progressText + emptyProgressText;
        const calculated = percentage * 100;

        return [bar, calculated];
    }
}

export const countElements = (arr: string[]): Record<string, number> => {
    const countMap: Record<string, number> = {}

    for (const element of arr) {
        if (countMap[element]) {
            countMap[element]++;
        } else {
            countMap[element] = 1;
        }
    }

    const sortedResult = Object.fromEntries(
        Object.entries(countMap).sort(([, countA], [, countB]) => countB - countA)
    );

    return sortedResult;
}

export const scramble = (string: string) => {
    let splitted = string.split("");

    for (var b = splitted.length - 1; 0 < b; b--) {
        var c = Math.floor(Math.random() * (b + 1));
        let d = splitted[b];
        splitted[b] = splitted[c];
        splitted[c] = d
    }

    return splitted.join('');
}

export const findElementsNotInArray = <T>(arr1: T[], arr2: T[]): T[] => {
    return arr1.filter((item) => !arr2.includes(item));
}

export const randomFromArray = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
}

export const randomFromArrayWithExclusion = (sourceArray: string[], exclusionArray: string[]): string => {
    const availableOptions = sourceArray.filter((item) => !exclusionArray.includes(item));

    if (availableOptions.length <= 0) return '';

    const randomIndex = Math.floor(Math.random() * availableOptions.length);

    return availableOptions[randomIndex];
}

export const time = (ms: number, style?: TimestampStylesString) => {
    return `<t:${Math.floor(ms / 1000)}${style ? `:${style}>` : '>'}`;
}

export const wait = async (duration: number) => {
    return new Promise((res) => setTimeout(res, duration));
}

export const fetchMee6Leaderboard = async (guildId: string, data?: string) => {
    const res = await axios.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}${data ? `?${data}` : ''}`);

    return res;
}
