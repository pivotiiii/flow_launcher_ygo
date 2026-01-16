import fetch from "node-fetch";

import {getCachedImage} from "./imageCache.js";

interface ApiResponse {
    data: Array<ApiResponseCard>;
}

interface ApiResponseCard {
    id: number;
    name: string;
    type: string;
    race: string;
    atk: number;
    def: number;
    level: number;
    linkval: number;
    attribute: string;
    ygoprodeck_url: string;
    card_images: Array<{image_url_small: string}>;
    misc_info: Array<{md_rarity: string; has_effect: number}>;
}

export interface Card {
    name: string;
    type: string;
    atk: number;
    def: number;
    level: number;
    attribute: string;
    race: string;
    linkval: number;
    url: string;
    img: string;
    id: number;
    md_rarity: string | undefined;
}

export const LanguageMap = {
    English: "",
    French: "&language=fr",
    German: "&language=de",
    Portuguese: "&language=pt",
    Italian: "&language=it",
};

const maxResults = 5;

export async function getCardsFromApi(apiUrlQuery: string, apiUrlOptions: string, language: keyof typeof LanguageMap, showMDRarity: boolean): Promise<Array<Card>> {
    const apiUrlBase = "https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=";

    const apiUrlLang = LanguageMap[language];
    const apiUrlNum = `&num=${maxResults}&offset=0`;
    const apiUrlMisc = showMDRarity === true ? "&misc=yes" : "";

    const apiUrl = apiUrlBase + apiUrlQuery + apiUrlOptions + apiUrlLang + apiUrlNum + apiUrlMisc;

    const response = await fetch(apiUrl);
    const responseJson = (await response.json()) as ApiResponse;

    if (Object.prototype.hasOwnProperty.call(responseJson, "error")) {
        return [];
    }

    const cards: Array<Card> = [];
    for (const cardApiData of responseJson["data"]) {
        const card = await mapApiCardToObjCard(cardApiData, showMDRarity);
        cards.push(card);
    }

    return cards;
}

async function mapApiCardToObjCard(cardApiData: ApiResponseCard, showMDRarity: boolean): Promise<Card> {
    let saveMDRarity = false;
    if (showMDRarity === true && cardApiData["misc_info"][0] && "md_rarity" in cardApiData["misc_info"][0]) {
        saveMDRarity = true;
    }
    const img_path = await getCachedImage(cardApiData["card_images"][0]!["image_url_small"], cardApiData["id"]);
    return {
        name: cardApiData["name"],
        type: cardApiData["type"],
        atk: cardApiData["atk"],
        def: cardApiData["def"],
        level: cardApiData["level"],
        attribute: cardApiData["attribute"],
        race: cardApiData["race"],
        linkval: cardApiData["linkval"],
        url: cardApiData["ygoprodeck_url"],
        img: img_path,
        id: cardApiData["id"],
        md_rarity: saveMDRarity === true ? cardApiData["misc_info"][0]!["md_rarity"] : undefined,
    };
}
