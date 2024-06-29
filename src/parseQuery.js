const cardTypesSingle = [
    "spell", //
    "trap",
    "link",
    "union",
    "gemini",
    "spirit",
    "toon",
];

const cardTypesComb = [
    "monster", //
    "normal",
    "effect",
    "ritual",
    "synchro",
    "xyz",
    "fusion",
    "pendulum",
    "flip",
    "tuner",
];

const attributes = [
    "light", //
    "dark",
    "water",
    "fire",
    "wind",
    "earth",
    "divine",
];
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

    let hasSingleCardType = false;

    let hasCombCardType = false;
    let hasMonsterCardType = false;
    let normalCardType = false;
    let effectCardType = false;
    let flipCardType = false;
    let tunerCardType = false;
    let ritualCardType = false;
    let pendulumCardType = false;
    let fusionCardType = false;
    let synchroCardType = false;
    let xyzCardType = false;

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

            if (text.length >= 4) {
                //shortest attribute or type or atk/def value (atkX) or singleCardType
                switch (true) {
                    case !hasAtk && text.slice(0, 3) === "atk" && !isNaN(parseInt(text.slice(3))):
                        hasAtk = true;
                        optionsArray.push(parseInt(text.slice(3)));
                        break;
                    case !hasDef && text.slice(0, 3) === "def" && !isNaN(parseInt(text.slice(3))):
                        hasDef = true;
                        optionsArray.push(parseInt(text.slice(3)));
                        break;
                    case !hasMonsterAttribute && attributes.includes(text):
                        hasMonsterAttribute = true;
                        optionsArray.push(`&attribute=${text}`);
                        break;
                    case !hasMonsterType && types.includes(text):
                        hasMonsterType = true;
                        switch (text) {
                            case "sea-serpent":
                                optionsArray.push("&race=Sea%20Serpent");
                                break;
                            case "winged-beast":
                                optionsArray.push("&race=Winged%20Beast");
                                break;
                            default:
                                optionsArray.push(`&race=${text}`);
                                break;
                        }
                        break;
                    case !hasSingleCardType && cardTypesSingle.includes(text):
                        hasSingleCardType = true;
                        switch (text) {
                            case "spell":
                                optionsArray.push("&type=Spell%20Card");
                                break;
                            case "trap":
                                optionsArray.push("&type=Trap%20Card");
                                break;
                            case "union":
                                optionsArray.push("&type=Union%20Effect%20Monster");
                                break;
                            case "link":
                                hasLink = true;
                                optionsArray.push("&type=Link%20Monster");
                                break;
                            default:
                                optionsArray.push(`&type=${text}%20Monster`);
                                break;
                        }
                        break;
                    default:
                        break;
                }
            }
            if (!hasSingleCardType && text.length >= 3 && cardTypesComb.includes(text)) {
                hasCombCardType = true;
                switch (text) {
                    case "monster":
                        hasMonsterCardType = true;
                        break;
                    case "normal":
                        normalCardType = true;
                        break;
                    case "effect":
                        effectCardType = true;
                        break;
                    case "flip":
                        flipCardType = true;
                        break;
                    case "tuner":
                        tunerCardType = true;
                        break;
                    case "ritual":
                        ritualCardType = true;
                        break;
                    case "pendulum":
                        pendulumCardType = true;
                        break;
                    case "fusion":
                        fusionCardType = true;
                        break;
                    case "synchro":
                        synchroCardType = true;
                        break;
                    case "xyz":
                        xyzCardType = true;
                        break;
                    default:
                        break;
                }
            }
            if (!hasNum && !isNaN(parseInt(text))) {
                hasNum = true;
                num = parseInt(text);
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

    if (normalCardType && !effectCardType) {
        optionsArray.push("&has_effect=0&atk=gte0");
    } else if (effectCardType && !normalCardType) {
        optionsArray.push("&has_effect=1&atk=gte0");
    } else if (hasMonsterCardType) {
        optionsArray.push("&atk=gte0");
    }

    if (!hasSingleCardType && hasCombCardType) {
        switch (true) {
            case pendulumCardType && ritualCardType:
                optionsArray.push("&type=Pendulum%20Effect%20Ritual%20Monster");
                break;
            case pendulumCardType && flipCardType:
                optionsArray.push("&type=Pendulum%20Flip%20Effect%20Monster");
                break;
            case pendulumCardType && tunerCardType:
                optionsArray.push("&type=Pendulum%20Tuner%20Effect%20Monster");
                break;
            case pendulumCardType && normalCardType:
                optionsArray.push("&type=Pendulum%20Normal%20Monster");
                break;
            case pendulumCardType && fusionCardType:
                optionsArray.push("&type=Pendulum%20Effect%20Fusion%20Monster");
                break;
            case pendulumCardType && synchroCardType:
                optionsArray.push("&type=Synchro%20Pendulum%20Effect%20Monster");
                break;
            case pendulumCardType && xyzCardType:
                optionsArray.push("&type=XYZ%20Pendulum%20Effect%20Monster");
                break;
            case pendulumCardType:
                optionsArray.push("&scale=gte0");
                break;
            case ritualCardType:
                optionsArray.push("&type=Ritual%20Monster%2CRitual%20Effect%20Monster%2CPendulum%20Effect%20Ritual%20Monster");
                break;
            case fusionCardType:
                optionsArray.push("&type=Fusion%20Monster%2CPendulum%20Effect%20Fusion%20Monster");
                break;
            case synchroCardType && tunerCardType:
                optionsArray.push("&type=Synchro%20Tuner%20Monster");
                break;
            case synchroCardType:
                optionsArray.push("&type=Synchro%20Monster%2CSynchro%20Tuner%20Monster%2CSynchro%20Pendulum%20Effect%20Monster");
                break;
            case xyzCardType:
                optionsArray.push("&type=XYZ%20Monster%2CXYZ%20Pendulum%20Effect%20Monster");
                break;
            case flipCardType && tunerCardType:
                optionsArray.push("&type=Flip%20Tuner%20Effect%20Monster");
                break;
            case flipCardType:
                optionsArray.push("&type=Flip%20Tuner%20Effect%20Monster%2CFlip%20Effect%20Monster%2CPendulum%20Flip%20Effect%20Monster");
                break;
            case tunerCardType:
                optionsArray.push("&type=Flip%20Tuner%20Effect%20Monster%2CNormal%20Tuner%20Monster%2CPendulum%20Tuner%20Effect%20Monster%2CTuner%20Monster%2CSynchro%20Tuner%20Monster");
                break;
            case normalCardType:
                optionsArray.push("&type=Normal%20Monster%2CNormal%20Tuner%20Monster%2CPendulum%20Normal%20Monster");
                break;
            default:
                break;
        }
    }

    const apiUrlOptions = optionsArray.join("");
    const apiUrlQuery = queryArray.join("%20");

    //console.log(optionsArray);
    //console.log(apiUrlOptions);
    //console.log(queryArray);
    //console.log(apiUrlQuery);

    return [apiUrlQuery, apiUrlOptions];
}
