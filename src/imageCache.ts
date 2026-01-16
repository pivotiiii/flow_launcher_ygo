import {writeFileSync, existsSync, mkdirSync, rmSync} from "fs";
import path from "path";
import {fileURLToPath} from "url";

import sharp from "sharp";
import {getCurrentResolution} from "win-screen-resolution";
import fetch from "node-fetch";

sharp.cache(false);

const cacheImageDimensions = Math.floor(getCurrentResolution().height / 20);
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../");
export const cachePath = path.resolve(__dirname, "cache");

export async function getCachedImage(url: string, id: number): Promise<string> {
    try {
        if (!existsSync(cachePath)) {
            mkdirSync(cachePath);
        }

        const cardPath = path.resolve(cachePath, `${id}.png`);
        if (existsSync(cardPath)) {
            return cardPath;
        }

        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        writeFileSync(cardPath, Buffer.from(buffer));

        const bufferSmall = await sharp(cardPath)
            .resize({
                width: cacheImageDimensions,
                height: cacheImageDimensions,
                fit: "contain",
                background: {r: 0, g: 0, b: 0, alpha: 0},
            })
            .toFormat("png")
            .toBuffer();

        await sharp(bufferSmall).toFile(cardPath);

        return cardPath;
    } catch (err) {
        return url;
    }
}

export function deleteCache() {
    if (existsSync(cachePath)) {
        rmSync(cachePath, {force: true, recursive: true});
    }
}
