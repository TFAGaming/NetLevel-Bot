const abbrev = (num: any) => {
    if (!num || isNaN(num)) return "0";

    if (typeof Intl !== "undefined") {
        return new Intl.NumberFormat("en", { notation: "compact" }).format(num);
    } else {
        let decPlaces = Math.pow(10, 1);
        var abbrev = ["K", "M", "B", "T"];
        for (var i = abbrev.length - 1; i >= 0; i--) {
            var size = Math.pow(10, (i + 1) * 3);
            if (size <= num) {
                num = Math.round((num * decPlaces) / size) / decPlaces;
                if (num == 1000 && i < abbrev.length - 1) {
                    num = 1;
                    i++;
                }
                num += abbrev[i];
                break;
            }
        }

        return `${num}`;
    }
}

const renderEmoji = async (ctx: CanvasRenderingContext2D, message: string, x: number, y: number) => {
    return ctx.fillText(message, x, y);
}

export default class Util {
    static shorten(text: string, len: number) {
        if (text.length <= len) return text;

        return text.substring(0, len).trim() + "...";
    }

    static toAbbrev(num: number | string) {
        return abbrev(num);
    }

    static renderEmoji(ctx: any, msg: string, x: number, y: number) {
        return renderEmoji(ctx, msg, x, y);
    }
}