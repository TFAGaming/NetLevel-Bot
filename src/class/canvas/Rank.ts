import { PresenceStatus } from "discord.js";

import Canvas from "@napi-rs/canvas";
import Util from './util';

export class Rank {
    public data: any;

    constructor() {
        this.data = {
            width: 934,
            height: 282,
            background: {
                type: "color",
                image: "#23272A"
            },
            progressBar: {
                rounded: true,
                x: 275.5,
                y: 183.75,
                height: 37.5,
                width: 596.5,
                track: {
                    color: "#484b4E"
                },
                bar: {
                    type: "color",
                    color: "#FFFFFF"
                }
            },
            overlay: {
                display: true,
                level: 0.5,
                color: "#333640"
            },
            avatar: {
                source: null,
                x: 70,
                y: 50,
                height: 180,
                width: 180
            },
            status: {
                width: 5,
                type: "online",
                color: "#43B581",
                circle: false
            },
            rank: {
                display: true,
                data: 1,
                textColor: "#FFFFFF",
                color: "#F3F3F3",
                displayText: "RANK"
            },
            level: {
                display: true,
                data: 1,
                textColor: "#FFFFFF",
                color: "#F3F3F3",
                displayText: "LEVEL"
            },
            currentXP: {
                data: 0,
                color: "#FFFFFF"
            },
            requiredXP: {
                data: 0,
                color: "#FFFFFF"
            },
            discriminator: {
                discrim: null,
                color: "rgba(255, 255, 255, 0.4)"
            },
            username: {
                name: null,
                color: "#FFFFFF"
            },
            renderEmojis: false,
            minXP: {
                data: 0,
                color: "#FFFFFF"
            }
        }

        this.registerFonts();
    }

    registerFonts() {
        Canvas.GlobalFonts.registerFromPath('./src/fonts/Inconsolata.tff', 'Inconsolata');

        return this;
    }

    renderEmojis(apply = false) {
        this.data.renderEmojis = !!apply;

        return this;
    }

    setFontSize(size: number) {
        this.data.fontSize = size;

        return this;
    }

    setUsername(name: string, color = "#FFFFFF") {
        this.data.username.name = name;
        this.data.username.color = color && typeof color === "string" ? color : "#FFFFFF";

        return this;
    }

    setDiscriminator(discriminator: string | number | null, color = "rgba(255, 255, 255, 0.4)") {
        this.data.discriminator.discrim = discriminator == null ? null : !Number.isNaN(discriminator) && String(discriminator).length === 4 ? `#${discriminator}` : String(discriminator).startsWith('@') ? discriminator : `@${discriminator}`;
        this.data.discriminator.color = color && typeof color === "string" ? color : "rgba(255, 255, 255, 0.4)";

        return this;
    }

    setProgressBar(color: string | string[], fillType = "COLOR", rounded = true) {

        switch (fillType) {
            case "COLOR":
                if (typeof color !== "string") throw new Error(`Color type must be a string, received ${typeof color}!`);
                this.data.progressBar.bar.color = color;
                this.data.progressBar.bar.type = "color";
                this.data.progressBar.rounded = !!rounded;
                break;
            case "GRADIENT":
                if (!Array.isArray(color)) throw new Error(`Color type must be Array, received ${typeof color}!`);
                this.data.progressBar.bar.color = color.slice(0, 2);
                this.data.progressBar.bar.type = "gradient";
                this.data.progressBar.rounded = !!rounded;
                break;
            default:
                throw new Error(`Unsupported progressbar type "${fillType}"!`);
        }

        return this;
    }

    setProgressBarTrack(color: string) {
        this.data.progressBar.track.color = color;

        return this;
    }

    setOverlay(color: string, level = 0.5, display = true) {
        this.data.overlay.color = color;
        this.data.overlay.display = !!display;
        this.data.overlay.level = level && typeof level === "number" ? level : 0.5;

        return this;
    }

    setRequiredXP(data: number, color = "#FFFFFF") {
        this.data.requiredXP.data = data;
        this.data.requiredXP.color = color && typeof color === "string" ? color : "#FFFFFF";

        return this;
    }

    setMinXP(data: number, color = "#FFFFFF") {
        this.data.minXP.data = data;
        this.data.minXP.color = color && typeof color === "string" ? color : "#FFFFFF";

        return this;
    }


    setCurrentXP(data: number, color = "#FFFFFF") {
        this.data.currentXP.data = data;
        this.data.currentXP.color = color && typeof color === "string" ? color : "#FFFFFF";

        return this;
    }

    setRank(data: number, text = "RANK", display = true) {
        this.data.rank.data = data;
        this.data.rank.display = !!display;
        if (!text || typeof text !== "string") text = "RANK";
        this.data.rank.displayText = text;

        return this;
    }

    setRankColor(text = "#FFFFFF", number = "#FFFFFF") {
        this.data.rank.textColor = text;
        this.data.rank.color = number;

        return this;
    }

    setLevelColor(text = "#FFFFFF", number = "#FFFFFF") {
        this.data.level.textColor = text;
        this.data.level.color = number;

        return this;
    }

    setLevel(data: number, text = "LEVEL", display = true) {
        this.data.level.data = data;
        this.data.level.display = !!display;
        this.data.level.displayText = text;

        return this;
    }

    setCustomStatusColor(color: string) {
        this.data.status.color = color;

        return this;
    }

    setStatus(status: PresenceStatus | 'streaming', circle = false, width: number | boolean = 5) {
        switch (status) {
            case "online":
                this.data.status.type = "online";
                this.data.status.color = "#43B581";
                break;
            case "idle":
                this.data.status.type = "idle";
                this.data.status.color = "#FAA61A";
                break;
            case "dnd":
                this.data.status.type = "dnd";
                this.data.status.color = "#F04747";
                break;
            case "offline":
                this.data.status.type = "offline";
                this.data.status.color = "#747F8E";
                break;
            case "streaming":
                this.data.status.type = "streaming";
                this.data.status.color = "#593595";
                break;
            default:
                throw new Error(`Invalid status "${status}"`);
        }

        if (width !== false) this.data.status.width = typeof width === "number" ? width : 5;
        else this.data.status.width = false;
        if ([true, false].includes(circle)) this.data.status.circle = circle;

        return this;
    }

    setBackground(type: 'COLOR' | 'IMAGE', data: string | Buffer) {
        switch (type) {
            case "COLOR":
                this.data.background.type = "color";
                this.data.background.image = data && typeof data === "string" ? data : "#23272A";
                break;
            case "IMAGE":
                this.data.background.type = "image";
                this.data.background.image = data;
                break;
        }

        return this;
    }

    setAvatar(data: string | Buffer) {
        this.data.avatar.source = data;

        return this;
    }

    async build(ops: { fontX?: string, fontY?: string } = { fontX: "MANROPE_BOLD, NOTO_COLOR_EMOJI", fontY: "MANROPE_BOLD, NOTO_COLOR_EMOJI" }) {
        let bg = null;

        if (this.data.background.type === "image") bg = await Canvas.loadImage(this.data.background.image);

        let avatar = await Canvas.loadImage(this.data.avatar.source);

        // create canvas instance
        const canvas = Canvas.createCanvas(this.data.width, this.data.height);
        const ctx = canvas.getContext("2d");

        // create background
        if (!!bg) {
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = this.data.background.image;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // add overlay
        if (!!this.data.overlay.display) {
            ctx.globalAlpha = this.data.overlay.level || 1;
            ctx.fillStyle = this.data.overlay.color;
            ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
        }

        // reset transparency
        ctx.globalAlpha = 1;

        // draw username
        // default: 36px
        ctx.font = `bold 40px ${ops.fontX}`;
        ctx.fillStyle = this.data.username.color;
        ctx.textAlign = "start";
        const name = Util.shorten(this.data.username.name, this.data.discriminator.discrim ? 10 : 15);

        const hasHandle = typeof this.data.discriminator.discrim === 'string' && this.data.discriminator.discrim.startsWith('@');
        const yCoord = hasHandle ? 140 : 164;

        // apply username
        !this.data.renderEmojis ? ctx.fillText(`${name}`, 257 + 15, yCoord) : await Util.renderEmoji(ctx, name, 257 + 15, yCoord);

        // draw discriminator
        if (typeof this.data.discriminator.discrim === 'string') {
            ctx.save();
            const discrim = this.data.discriminator.discrim;
            if (discrim.startsWith('#')) {
                ctx.font = `40px ${ops.fontY}`;
                ctx.fillStyle = this.data.discriminator.color;
                ctx.textAlign = "center";

                ctx.fillText(discrim.substring(0, 5), ctx.measureText(name).width + 20 + 335, yCoord);
            } else {
                ctx.font = `30px ${ops.fontY}`;
                ctx.fillStyle = this.data.discriminator.color;
                ctx.textAlign = "center";

                ctx.fillText(discrim, 320, 170);
            }

            ctx.restore();
        }

        // fill level
        let levelText = '-';

        if (this.data.level.display && !isNaN(this.data.level.data)) {
            levelText = `${this.data.level.displayText} ${Util.toAbbrev(parseInt(this.data.level.data))}`;
            ctx.font = `bold 40px ${ops.fontX}`;
            ctx.fillStyle = this.data.level.textColor;
            ctx.textAlign = "start";

            ctx.fillText(levelText, canvas.width - (ctx.measureText(levelText).width * 3), 82);
        }

        // fill rank
        if (this.data.rank.display && !isNaN(this.data.rank.data)) {
            const rankText = `${this.data.rank.displayText} ${Util.toAbbrev(parseInt(this.data.rank.data))}`;
            ctx.font = `bold 40px ${ops.fontX}`;
            ctx.fillStyle = this.data.rank.textColor;
            ctx.textAlign = "start";
            ctx.fillText(rankText, canvas.width - (ctx.measureText(levelText).width * 1.5), 82);
        }

        // show progress
        ctx.font = `bold 30px ${ops.fontX}`;
        ctx.fillStyle = this.data.requiredXP.color;
        ctx.textAlign = "start";

        ctx.fillText("/ " + Util.toAbbrev(this.data.requiredXP.data), 670 + ctx.measureText(Util.toAbbrev(this.data.currentXP.data)).width + 15, yCoord);

        ctx.fillStyle = this.data.currentXP.color;

        ctx.fillText(Util.toAbbrev(this.data.currentXP.data), 670, yCoord);

        // draw progressbar
        ctx.beginPath();
        if (!!this.data.progressBar.rounded) {
            // bg
            ctx.fillStyle = this.data.progressBar.track.color;
            ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * Math.PI, 0.5 * Math.PI, true);
            ctx.fill();
            ctx.fillRect(257 + 18.5, 147.5 + 36.25, 615 - 18.5, 37.5);
            ctx.arc(257 + 615, 147.5 + 18.5 + 36.25, 18.75, 1.5 * Math.PI, 0.5 * Math.PI, false);
            ctx.fill();

            ctx.beginPath();
            // apply color
            if (this.data.progressBar.bar.type === "gradient") {
                let gradientContext = ctx.createRadialGradient(this._calculateProgress, 0, 500, 0, 0, 0);

                this.data.progressBar.bar.color.forEach((color: string, index: number) => {
                    gradientContext.addColorStop(index, color);
                });

                ctx.fillStyle = gradientContext;
            } else {
                ctx.fillStyle = this.data.progressBar.bar.color;
            }

            // progress bar
            ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * Math.PI, 0.5 * Math.PI, true);
            ctx.fill();
            ctx.fillRect(257 + 18.5, 147.5 + 36.25, this._calculateProgress, 37.5);
            ctx.arc(257 + 18.5 + this._calculateProgress, 147.5 + 18.5 + 36.25, 18.75, 1.5 * Math.PI, 0.5 * Math.PI, false);
            ctx.fill();
        } else {

            // progress bar
            ctx.fillStyle = this.data.progressBar.bar.color;
            ctx.fillRect(this.data.progressBar.x, this.data.progressBar.y, this._calculateProgress, this.data.progressBar.height);

            // outline
            ctx.beginPath();
            ctx.strokeStyle = this.data.progressBar.track.color;
            ctx.lineWidth = 7;
            ctx.strokeRect(this.data.progressBar.x, this.data.progressBar.y, this.data.progressBar.width, this.data.progressBar.height);
        }

        ctx.save();

        // circle
        ctx.beginPath();
        ctx.arc(125 + 10, 125 + 20, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // draw avatar
        ctx.drawImage(avatar, 35, 45, this.data.avatar.width + 20, this.data.avatar.height + 20);
        ctx.restore();

        // draw status
        if (!!this.data.status.circle) {
            ctx.beginPath();
            ctx.fillStyle = this.data.status.color;
            ctx.arc(215, 205, 20, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        } else if (!this.data.status.circle && this.data.status.width !== false) {
            ctx.beginPath();
            ctx.arc(135, 145, 100, 0, Math.PI * 2, true);
            ctx.strokeStyle = this.data.status.color;
            ctx.lineWidth = this.data.status.width;
            ctx.stroke();
        }

        return canvas.encode("png");
    }

    get _calculateProgress() {
        const cx = this.data.currentXP.data;
        const rx = this.data.requiredXP.data;

        if (rx <= 0) return 1;
        if (cx > rx) return parseInt(this.data.progressBar.width) || 0;

        if (this.data.minXP.data > 0) {
            const mx = this.data.minXP.data;
            if (cx < mx) return 0;

            const nx = cx - mx;
            const nr = rx - mx;
            return (nx * 615) / nr;
        }

        let width = (cx * 615) / rx;
        if (width > this.data.progressBar.width) width = this.data.progressBar.width;
        return parseInt(width.toString()) || 0;
    }
}