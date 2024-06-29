import {writeFileSync, existsSync, mkdirSync, rmSync, readdirSync} from "fs";
import path from "path";
import {fileURLToPath} from "url";

import open from "../node_modules/open/index.js";
import sharp from "../node_modules/sharp/lib/index.js";
import {getCurrentResolution} from "win-screen-resolution";

import {parseQuery} from "./parseQuery.js";

sharp.cache(false);
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../");
const cachePath = path.resolve(__dirname, "cache");
const maxResults = 5;
const cacheImageDimensions = Math.floor(getCurrentResolution().height / 20);

const {method, parameters, settings} = JSON.parse(process.argv[2]);

if (method === "query") {
    const query = parameters[0];
    if (query.length < 2) {
        console.log(JSON.stringify({result: []}));
    } else if (query.startsWith(":cache")) {
        showDeleteCache();
    } else if (query.startsWith(":help") || query.startsWith(":?")) {
        showHelp();
    } else {
        logCards(query);
    }
} else if (method === "open") {
    open(parameters[0]);
} else if (method === "deleteCache") {
    deleteCache();
}

async function getCards(query) {
    const apiUrlBase = "https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=";
    const [apiUrlQuery, apiUrlOptions] = parseQuery(query);
    let apiUrlLang = getLang();
    const apiUrlNum = `&num=${maxResults}&offset=0`;

    const apiUrl = apiUrlBase + apiUrlQuery + apiUrlOptions + apiUrlLang + apiUrlNum;
    //console.log(apiUrl);

    const response = await fetch(apiUrl);
    const responseJson = await response.json();

    if (Object.prototype.hasOwnProperty.call(responseJson, "error")) {
        return [];
    }

    const cards = [];

    responseJson["data"].forEach(function (card) {
        cards.push({
            name: card["name"],
            type: card["type"],
            atk: card["atk"],
            def: card["def"],
            level: card["level"],
            attribute: card["attribute"],
            race: card["race"],
            linkval: card["linkval"],
            url: card["ygoprodeck_url"],
            img: card["card_images"][0]["image_url_small"],
            id: card["id"],
        });
    });

    return cards;
}

async function logCards(query) {
    const results = {result: []};

    const cards = await getCards(query);

    for (const card of cards) {
        let imagePath = path.resolve(cachePath, `${card.id}.png`);
        if (!existsSync(imagePath)) {
            imagePath = await cacheCardImg(card.img, card.id);
        }
        results.result.push(getCardResult(card, imagePath));
    }
    console.log(JSON.stringify(results));
}

function getCardResult(card, imagePath) {
    const result = {
        Title: card.name,
        Subtitle: "",
        JsonRPCAction: {
            method: "open",
            parameters: [`${card.url}`],
        },
        IcoPath: imagePath,
        score: 0,
    };

    if (card.type.includes("Link")) {
        result.Subtitle = `Link-${card.linkval} ${card.attribute} ${card.race} ${card.type} | ATK:${card.atk}`;
    } else if (card.type.includes("Monster")) {
        result.Subtitle = `${card.type.includes("XYZ") ? "Rank" : "Level"} ${card.level} ${card.attribute} ${card.race} ${card.type} | ATK:${card.atk} DEF:${card.def}`;
    } else if (card.type.includes("Trap") || card.type.includes("Spell")) {
        result.Subtitle = `${card.race} ${card.type}`;
    }

    return result;
}

async function cacheCardImg(url, id) {
    try {
        if (!existsSync(cachePath)) {
            mkdirSync(cachePath);
        }

        const cardPath = path.resolve(cachePath, `${id}.png`);

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

function showDeleteCache() {
    if (!existsSync(cachePath)) {
        mkdirSync(cachePath);
    }
    console.log(
        JSON.stringify({
            result: [
                {
                    Title: "Delete Card Image Cache",
                    Subtitle: `${readdirSync(cachePath).length} cards at ${cachePath}`,
                    JsonRPCAction: {
                        method: "deleteCache",
                        parameters: [],
                    },
                    IcoPath: path.resolve(__dirname, "img", "app.png"),
                    score: 0,
                },
                {
                    Title: "Open Card Image Cache",
                    Subtitle: cachePath,
                    JsonRPCAction: {
                        method: "open",
                        parameters: [cachePath],
                    },
                    IcoPath: path.resolve(__dirname, "img", "app.png"),
                    score: 10,
                },
            ],
        })
    );
}

function deleteCache() {
    if (existsSync(cachePath)) {
        rmSync(cachePath, {force: true, recursive: true});
    }
}

function showHelp() {
    console.log(
        JSON.stringify({
            result: [
                {
                    Title: "Open Help",
                    Subtitle: "",
                    JsonRPCAction: {
                        method: "open",
                        parameters: ["https://github.com/pivotiiii/flow_launcher_ygo/blob/master/README.md"],
                    },
                    IcoPath: path.resolve(__dirname, "img", "app.png"),
                    score: 0,
                },
            ],
        })
    );
}

function getLang() {
    switch (settings.language) {
        case "English":
            return "";
        case "French":
            return "&language=fr";
        case "German":
            return "&language=de";
        case "Portuguese":
            return "&language=pt";
        case "Italian":
            return "&language=it";
        default:
            return "";
    }
}
