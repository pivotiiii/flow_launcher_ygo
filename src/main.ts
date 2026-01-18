import {existsSync, mkdirSync, rmSync, readdirSync} from "fs";
import path from "path";
import {fileURLToPath} from "url";

import open from "open";

import {parseQuery, ParseQueryResult} from "./parseQuery.js";
import {Card, LanguageMap, getCardsFromApi} from "./checkApi.js";
import {cachePath, deleteCache} from "./imageCache.js";

const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../");

interface FLResponse {
    result: Array<FLResult>;
}

interface FLResult {
    Title: string;
    Subtitle: string;
    JsonRPCAction: {
        method: string;
        parameters: Array<string>;
    };
    IcoPath: string;
    score: number;
}

interface Settings {
    showMDRarity: boolean;
    language: keyof typeof LanguageMap;
}

const {method, parameters, settings} = JSON.parse(process.argv[2]!) as {method: string; parameters: Array<string>; settings: Settings};

if (method === "query") {
    const query = parameters[0]!;
    if (query.length < 2) {
        console.log(JSON.stringify({result: []}));
    } else if (query.startsWith(":cache")) {
        showDeleteCache();
    } else if (query.startsWith(":help") || query.startsWith(":?")) {
        showHelp();
    } else {
        showCards(query);
    }
} else if (method === "open") {
    open(parameters[0]!);
} else if (method === "deleteCache") {
    deleteCache();
}

async function showCards(query: string) {
    const results: FLResponse = {result: []};

    const parsedQuery: ParseQueryResult = parseQuery(query);
    if (parsedQuery.options.includes("type=link%20monster&def=1")) {
        showInvalidQuery();
        return;
    }
    const cards: Array<Card> = await getCardsFromApi(parsedQuery.query, parsedQuery.options, settings.language, settings.showMDRarity);
    if (cards.length === 0) {
        showInvalidQuery();
        return;
    }

    for (const card of cards) {
        results.result.push(makeCardResult(card));
    }
    console.log(JSON.stringify(results));
}

function makeCardResult(card: Card) {
    const result: FLResult = {
        Title: card.name,
        Subtitle: "",
        JsonRPCAction: {
            method: "open",
            parameters: [`${card.url}`],
        },
        IcoPath: card.img,
        score: 0,
    };

    if (card.type.includes("Link")) {
        result.Subtitle = `Link-${card.linkval} ${card.attribute} ${card.race} ${card.type} | ATK:${card.atk}`;
    } else if (card.type.includes("Monster")) {
        result.Subtitle = `${card.type.includes("XYZ") ? "Rank" : "Level"} ${card.level} ${card.attribute} ${card.race} ${card.type} | ATK:${card.atk} DEF:${card.def}`;
    } else if (card.type.includes("Trap") || card.type.includes("Spell")) {
        result.Subtitle = `${card.race} ${card.type}`;
    }

    if (settings.showMDRarity === true) {
        result.Subtitle = `(${card.md_rarity ?? "?"}) | ${result.Subtitle}`;
    }

    return result;
}

function showInvalidQuery() {
    const response: FLResponse = {
        result: [
            {
                Title: "No Results",
                Subtitle: "",
                JsonRPCAction: {
                    method: "",
                    parameters: [],
                },
                IcoPath: path.resolve(__dirname, "img", "app.png"),
                score: 0,
            },
        ],
    };
    console.log(JSON.stringify(response));
}

function showDeleteCache() {
    if (!existsSync(cachePath)) {
        mkdirSync(cachePath);
    }
    const response: FLResponse = {
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
    };
    console.log(JSON.stringify(response));
}

function showHelp() {
    const response: FLResponse = {
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
    };
    console.log(JSON.stringify(response));
}
