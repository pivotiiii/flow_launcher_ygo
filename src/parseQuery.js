const cardTypes = [
    "monster", //needs special handling
    "normal",
    "effect", //needs special handling
    "ritual", //needs special handling
    "synchro",
    "xyz",
    "link",
    "fusion",
    "pendulum", //needs special handling
    "flip", //needs special handling
    "union", //needs special handling
    "tuner",
    "gemini",
    "spirit",
    "toon",
];

const attributes = ["light", "dark", "water", "fire", "wind", "earth", "divine"];

const types = [
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
];

export function parseQuery(query) {
    let optionsArray = [];
    let queryArray = [];

    let hasAtk = false;
    let hasDef = false;

    let hasCardType = false;
    let hasMonsterAttribute = false;
    let hasMonsterType = false;

    let hasLink = false;
    let hasNum = false;
    let num = null;

    const querySplit = query.split(" ");
    for (let idx in querySplit) {
        let text = querySplit[idx];
        if (text.startsWith(":")) {
            text = text.slice(1).toLowerCase();
            if (!hasNum && !isNaN(parseInt(text))) {
                hasNum = true;
                num = parseInt(text);
            } else if (!hasCardType && text === "spell") {
                hasCardType = true;
                optionsArray.push("&type=Spell%20Card");
            } else if (!hasCardType && text === "trap") {
                hasCardType = true;
                optionsArray.push("&type=Trap%20Card");
            } else if (!hasAtk && text.slice(0, 3) === "atk" && !isNaN(parseInt(text.slice(3)))) {
                hasAtk = true;
                optionsArray.push(`&atk=${text}`);
            } else if (!hasDef && text.slice(0, 3) === "def" && !isNaN(parseInt(text.slice(3)))) {
                hasDef = true;
                optionsArray.push(`&def=${text}`);
            } else if (!hasCardType && cardTypes.includes(text)) {
                hasCardType = true;
                switch (text) {
                    case "monster":
                        optionsArray.push("&atk=gte0");
                        break;
                    case "pendulum":
                        optionsArray.push("&scale=gte0");
                        break;
                    case "link":
                        hasLink = true;
                        optionsArray.push("&type=Link%20Monster");
                        break;
                    case "flip":
                        optionsArray.push("&type=Flip%20Effect%20Monster");
                        break;
                    case "ritual":
                        optionsArray.push("&type=Ritual%20Effect%20Monster");
                        break;
                    case "union":
                        optionsArray.push("&type=Union%20Effect%20Monster");
                        break;
                    default:
                        optionsArray.push(`&type=${text}%20Monster`);
                        break;
                }
            } else if (!hasMonsterAttribute && attributes.includes(text)) {
                hasMonsterAttribute = true;
                optionsArray.push(`&attribute=${text}`);
            } else if (!hasMonsterType && types.includes(text)) {
                hasMonsterType = true;
                switch (text) {
                    case "sea-serpent":
                        optionsArray.push("&race=Sea%20Serpent");
                        break;
                    case "winged-beast":
                        optionsArray.push("&race=Winged%20Beast");
                        break;
                    default:
                        optionsArray.push(`&race=${encodeURIComponent(text)}`);
                        break;
                }
            }
        } else {
            queryArray.push(text);
        }
    }
    if (hasLink && hasNum) {
        optionsArray.push(`&link=${num}`);
    } else if (hasNum) {
        optionsArray.push(`&level=${num}`);
    }
    const apiUrlOptions = optionsArray.join("");
    const apiUrlQuery = queryArray.join("%20");

    //console.log(optionsArray);
    //console.log(apiUrlOptions);
    //console.log(queryArray);
    //console.log(apiUrlQuery);

    return [apiUrlQuery, apiUrlOptions];
}
