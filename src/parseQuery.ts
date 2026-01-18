export interface ParseQueryResult {
    query: string;
    options: string;
}

const NO_CARDS: ParseQueryResult = {query: "", options: "&type=link%20monster&def=1"};

const cardTypes = {
    pendulum: [
        "Pendulum Effect Monster",
        "Pendulum Normal Monster",
        "Pendulum Tuner Effect Monster",
        "Pendulum Flip Effect Monster",
        "Pendulum Effect Fusion Monster",
        "Pendulum Effect Ritual Monster",
        "Synchro Pendulum Effect Monster",
        "XYZ Pendulum Effect Monster",
    ],
    ritual: ["Ritual Monster", "Ritual Effect Monster", "Pendulum Effect Ritual Monster"],
    fusion: ["Fusion Monster", "Pendulum Effect Fusion Monster"],
    synchro: ["Synchro Monster", "Synchro Tuner Monster", "Synchro Pendulum Effect Monster"],
    xyz: ["XYZ Monster", "XYZ Pendulum Effect Monster"],
    flip: ["Flip Tuner Effect Monster", "Flip Effect Monster", "Pendulum Flip Effect Monster"],
    tuner: ["Flip Tuner Effect Monster", "Normal Tuner Monster", "Pendulum Tuner Effect Monster", "Tuner Monster", "Synchro Tuner Monster"],
    normal: ["Normal Monster", "Normal Tuner Monster", "Pendulum Normal Monster"],
    spell: ["Spell Card"],
    trap: ["Trap Card"],
    link: ["Link Monster"],
    union: ["Union Effect Monster"],
    gemini: ["Gemini Monster"],
    spirit: ["Spirit Monster"],
    toon: ["Toon Monster"],
    monster: Array<string>(),
};
const _CT_monster_temp = new Set(Object.values(cardTypes).flat());
_CT_monster_temp.delete("Spell Card");
_CT_monster_temp.delete("Trap Card");
cardTypes.monster = Array.from(_CT_monster_temp);

const cardTypesSpecial = {
    effect: "&has_effect=1&atk=gte0", // excludes some monsters with ??? atk, -1 in the api
};

const attributes = [
    "light", //
    "dark",
    "water",
    "fire",
    "wind",
    "earth",
    "divine",
];
const races = [
    "aqua",
    "beast",
    "beast-warrior",
    "cyberse",
    "dinosaur",
    "divine-beast",
    "dragon",
    "fairy",
    "fiend",
    "fish",
    "illusion",
    "insect",
    "machine",
    "plant",
    "psychic",
    "pyro",
    "reptile",
    "rock",
    "sea-serpent", //needs special handling
    "spellcaster",
    "thunder",
    "warrior",
    "winged-beast", //needs special handling
    "wyrm",
    "zombie",
    // "normal", // this is a lot of trouble with also being a card type
    "field",
    "equip",
    "continuous",
    "quick-play",
    // "ritual", // this is a lot of trouble with also being a card type
    "counter",
];

const racesSpecial = {
    "sea-serpent": "Sea%20Serpent",
    "winged-beast": "Winged%20Beast",
};

export function parseQuery(query: string): ParseQueryResult {
    let optionsArray: string[] = [];
    let queryArray: string[] = [];

    let cardTypesSet = new Set<string>();
    let cardTypesSpecialSet = new Set<string>();
    let number: number | null = null;
    let atk: number | null = null;
    let def: number | null = null;
    let attribute: string | null = null;
    let race: string | null = null;

    let potentialNormalST = false;
    let potentialRitualSp = false;

    const querySplit = query.toLowerCase().split(" ");
    for (let text of querySplit) {
        if (!text.startsWith(":")) {
            queryArray.push(text);
            continue;
        }
        if (text.startsWith(":")) {
            text = text.slice(1);

            if (!isNaN(parseInt(text))) {
                if (number !== null) return NO_CARDS;
                number = parseInt(text);
                continue;
            }

            //shortest attribute or type or atk/def value (atkX) or singleCardType
            if (text.length >= 3) {
                if (text === "normal") {
                    potentialNormalST = true;
                } else if (text === "ritual") {
                    potentialRitualSp = true;
                }

                switch (true) {
                    case text.slice(0, 3) === "atk" && !isNaN(parseInt(text.slice(3))):
                        if (atk !== null) return NO_CARDS;
                        atk = parseInt(text.slice(3));
                        continue;
                    case text.slice(0, 3) === "atk" && /^\?+$/.test(text.slice(3)):
                        if (atk !== null) return NO_CARDS;
                        atk = -1;
                        continue;
                    case text.slice(0, 3) === "def" && !isNaN(parseInt(text.slice(3))):
                        if (def !== null) return NO_CARDS;
                        def = parseInt(text.slice(3));
                        continue;
                    case text.slice(0, 3) === "def" && /^\?+$/.test(text.slice(3)):
                        if (def !== null) return NO_CARDS;
                        def = -1;
                        continue;
                    case attributes.includes(text):
                        if (attribute !== null) return NO_CARDS;
                        attribute = text;
                        continue;
                    case text in cardTypesSpecial:
                        cardTypesSpecialSet.add(text);
                        continue;
                    case text in cardTypes:
                        cardTypesSet.add(text);
                        continue;
                    case races.includes(text): // must be after card types to avoid confusion with "normal" and "ritual"
                        if (race !== null) return NO_CARDS;
                        race = text;
                        continue;
                }
            }
        }
    }

    if (atk !== null) {
        if (atk === -1) {
            optionsArray.push("&atk=lt0");
        } else {
            optionsArray.push(`&atk=${atk}`);
        }
    }
    if (def !== null) {
        if (def === -1) {
            optionsArray.push("&def=lt0");
        } else {
            optionsArray.push(`&def=${def}`);
        }
    }
    if (attribute !== null) {
        optionsArray.push(`&attribute=${attribute}`);
    }
    if (race !== null) {
        optionsArray.push(`&race=${racesSpecial[race as keyof typeof racesSpecial] || race}`);
    }

    if (cardTypesSet.has("link") && number !== null) {
        optionsArray.push(`&link=${number}`);
    } else if (number !== null) {
        optionsArray.push(`&level=${number}`);
    }

    if ((cardTypesSet.has("spell") || cardTypesSet.has("trap")) && potentialNormalST) {
        cardTypesSet.delete("normal");
        optionsArray.push("&race=normal");
    }
    if (cardTypesSet.has("spell") && potentialRitualSp) {
        cardTypesSet.delete("ritual");
        optionsArray.push("&race=ritual");
    }

    if (!cardTypesSet.has("spell") && !cardTypesSet.has("trap")) {
        if (cardTypesSet.has("normal") && cardTypesSpecialSet.has("effect")) {
            return NO_CARDS;
        }
    }

    if (cardTypesSpecialSet.size > 0) {
        for (const type of cardTypesSpecialSet) {
            optionsArray.push(cardTypesSpecial[type as keyof typeof cardTypesSpecial]);
        }
    }

    if (cardTypesSet.size > 0) {
        let lists: string[][] = [];
        for (const type of cardTypesSet) {
            lists.push(cardTypes[type as keyof typeof cardTypes]);
        }
        const common = lists.reduce((a, b) => a.filter((c: string) => b.includes(c)));
        if (common.length > 0) {
            optionsArray.push(`&type=${encodeURIComponent(common.join(","))}`);
        } else {
            return NO_CARDS;
        }
    }

    const apiUrlOptions = optionsArray.join("").toLowerCase();
    const apiUrlQuery = queryArray.join("%20").toLowerCase();

    return {query: apiUrlQuery, options: apiUrlOptions};
}
