const NO_CARDS = "&type=link%20monster&def=1";

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
};

const cardTypesSpecial = {
    monster: "&atk=gte0", // excludes some cards with "???" atk, -1 in the api result
    effect: "&has_effect=1&atk=gte0",
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

export function parseQuery(query) {
    let optionsArray = [];
    let queryArray = [];

    let cardTypesSet = new Set();
    let cardTypesSpecialSet = new Set();
    let number = null;
    let atk = null;
    let def = null;
    let attribute = null;
    let race = null;

    let potentialNormal = false;
    let potentialRitual = false;

    const querySplit = query.toLowerCase().split(" ");
    for (let text of querySplit) {
        if (!text.startsWith(":")) {
            queryArray.push(text);
            continue;
        }
        if (text.startsWith(":")) {
            text = text.slice(1);

            if (!isNaN(parseInt(text))) {
                number = parseInt(text);
                continue;
            }

            //shortest attribute or type or atk/def value (atkX) or singleCardType
            if (text.length >= 3) {
                if (text === "normal") {
                    potentialNormal = true;
                } else if (text === "ritual") {
                    potentialRitual = true;
                }

                switch (true) {
                    case text.slice(0, 3) === "atk" && !isNaN(parseInt(text.slice(3))):
                        atk = parseInt(text.slice(3));
                        continue;
                    case text.slice(0, 3) === "def" && !isNaN(parseInt(text.slice(3))):
                        def = parseInt(text.slice(3));
                        continue;
                    case attributes.includes(text):
                        attribute = text;
                        continue;
                    case text in cardTypesSpecial:
                        cardTypesSpecialSet.add(text);
                        continue;
                    case text in cardTypes:
                        cardTypesSet.add(text);
                        continue;
                    case races.includes(text): // must be after card types to avoid confusion with "normal" and "ritual"
                        race = text;
                        continue;
                }
            }
        }
    }

    if (atk !== null) {
        optionsArray.push(`&atk=${atk}`);
    }
    if (def !== null) {
        optionsArray.push(`&def=${def}`);
    }
    if (attribute !== null) {
        optionsArray.push(`&attribute=${attribute}`);
    }
    if (race !== null) {
        optionsArray.push(`&race=${racesSpecial[race] || race}`);
    }

    if (cardTypesSet.has("link") && number !== null) {
        optionsArray.push(`&link=${number}`);
    } else if (number !== null) {
        optionsArray.push(`&level=${number}`);
    }

    if ((cardTypesSet.has("spell") || cardTypesSet.has("trap")) && potentialNormal) {
        cardTypesSet.delete("normal");
        optionsArray.push("&race=normal");
    }
    if (cardTypesSet.has("spell") && potentialRitual) {
        cardTypesSet.delete("ritual");
        optionsArray.push("&race=ritual");
    }

    if (!cardTypesSet.has("spell") && !cardTypesSet.has("trap")) {
        if (cardTypesSet.has("normal") && !cardTypesSpecialSet.has("effect")) {
            optionsArray.push("&has_effect=0&atk=gte0");
        } else if (cardTypesSpecialSet.has("effect") && !cardTypesSet.has("normal")) {
            optionsArray.push("&has_effect=1&atk=gte0");
        } else if (cardTypesSet.has("normal") && cardTypesSpecialSet.has("effect")) {
            optionsArray.push(NO_CARDS);
        }
    }

    if (cardTypesSpecialSet.size > 0) {
        for (const type of cardTypesSpecialSet) {
            optionsArray.push(cardTypesSpecial[type]);
        }
    }

    if (cardTypesSet.size > 0) {
        let lists = [];
        for (const type of cardTypesSet) {
            lists.push(cardTypes[type]);
        }
        const common = lists.reduce((a, b) => a.filter((c) => b.includes(c)));
        if (common.length > 0) {
            optionsArray.push(`&type=${encodeURIComponent(common.join(","))}`);
        } else {
            optionsArray.push(NO_CARDS);
        }
    }

    const apiUrlOptions = optionsArray.join("").toLowerCase();
    const apiUrlQuery = queryArray.join("%20").toLowerCase();

    return {query: apiUrlQuery, options: apiUrlOptions};
}
