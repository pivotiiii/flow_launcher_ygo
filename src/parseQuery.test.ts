import {parseQuery} from "./parseQuery";

describe("parseQuery", () => {
    describe("return value structure", () => {
        it("should always return an object with query and options properties", () => {
            const queries = ["blue eyes", "card :light", "synchro :synchro :tuner :dark :atk2500", "", ":spell"];
            queries.forEach((query) => {
                const result = parseQuery(query);
                expect(typeof result).toBe("object");
                expect(result).not.toBeNull();
                expect(result).toHaveProperty("query");
                expect(result).toHaveProperty("options");
                expect(typeof result.query).toBe("string");
                expect(typeof result.options).toBe("string");
            });
        });
    });

    describe("basic query parsing", () => {
        it("should return card name as first element and empty options as second for simple query", () => {
            const result = parseQuery("Blue Eyes");
            expect(result).toHaveProperty("query");
            expect(result).toHaveProperty("options");
            expect(result.query).toBe("blue%20eyes");
            expect(result.options).toBe("");
        });

        it("should handle single word queries", () => {
            const result = parseQuery("Exodia");
            expect(result.query).toBe("exodia");
            expect(result.options).toBe("");
        });

        it("should URL encode card names with spaces", () => {
            const result = parseQuery("Dark Magician");
            expect(result.query).toBe("dark%20magician");
        });

        it("should be case insensitive for all filters", () => {
            const result1 = parseQuery("Blue Eyes :LIGHT :SPELL");
            const result2 = parseQuery("blue eyes :light :spell");
            expect(result1.query).toBe("blue%20eyes");
            expect(result2.query).toBe("blue%20eyes");
            expect(result1.options).toContain("&attribute=light");
            expect(result2.options).toContain("&attribute=light");
            expect(result1.options).toContain("spell%20card");
            expect(result2.options).toContain("spell%20card");
        });

        it("should handle empty query", () => {
            const result = parseQuery("");
            expect(result).toHaveProperty("query");
            expect(result).toHaveProperty("options");
            expect(result.query).toBe("");
        });

        it("should preserve card name with filters", () => {
            const result = parseQuery("Dark Magician :normal :dark :spellcaster :7 :atk2500 :def2100");
            expect(result.query).toBe("dark%20magician");
            expect(result.options).toContain("normal%20monster");
            expect(result.options).toContain("&attribute=dark");
            expect(result.options).toContain("&race=spellcaster");
            expect(result.options).toContain("&level=7");
            expect(result.options).toContain("atk=2500");
            expect(result.options).toContain("def=2100");
        });

        it("should handle multiple spaces between words", () => {
            const result = parseQuery("Blue   Eyes   White   Dragon");
            expect(result.query).toContain("blue");
            expect(result.query).toContain("eyes");
            expect(result.query).toContain("white");
            expect(result.query).toContain("dragon");
        });
    });

    describe("card type filters - single types", () => {
        it("should handle :spell filter", () => {
            const result = parseQuery("Blue Eyes :spell");
            expect(result.query).toBe("blue%20eyes");
            expect(result.options).toBe("&type=spell%20card");
        });

        it("should handle :trap filter", () => {
            const result = parseQuery("Pot of Greed :trap");
            expect(result.query).toBe("pot%20of%20greed");
            expect(result.options).toBe("&type=trap%20card");
        });

        it("should handle single monster card type filters", () => {
            expect(parseQuery("card :gemini").options).toBe("&type=gemini%20monster");
            expect(parseQuery("card :spirit").options).toBe("&type=spirit%20monster");
            expect(parseQuery("card :toon").options).toBe("&type=toon%20monster");
            expect(parseQuery("union :union").options).toBe("&type=union%20effect%20monster");
            expect(parseQuery("card :link").options).toBe("&type=link%20monster");
        });
    });

    describe("card type filters - combinable types", () => {
        it("should handle :monster filter", () => {
            const result = parseQuery("blue eyes :monster");
            expect(result.options).toContain("pendulum%20effect%20monster");
            expect(result.options).toContain("ritual%20monster");
            expect(result.options).toContain("fusion%20monster");
            expect(result.options).toContain("synchro%20monster");
            expect(result.options).toContain("xyz%20monster");
            expect(result.options).toContain("flip%20effect%20monster");
            expect(result.options).toContain("tuner%20monster");
            expect(result.options).toContain("normal%20monster");
            expect(result.options).toContain("link%20monster");
            expect(result.options).toContain("union%20effect%20monster");
            expect(result.options).toContain("gemini%20monster");
            expect(result.options).toContain("spirit%20monster");
            expect(result.options).toContain("toon%20monster");
        });

        it("should handle :normal filter (normal monsters only)", () => {
            const result = parseQuery("card :normal");
            expect(result.options).toContain("normal%20monster");
            expect(result.options).toContain("normal%20tuner%20monster");
            expect(result.options).toContain("pendulum%20normal%20monster");
        });

        it("should handle :normal and :pendulum filter (normal pend monsters only)", () => {
            const result = parseQuery("card :normal :pendulum");
            expect(result.options).toBe("&type=pendulum%20normal%20monster");
        });

        it("should handle :effect filter (effect monsters only)", () => {
            const result = parseQuery("card :effect");
            expect(result.options).toContain("&has_effect=1");
            expect(result.options).toContain("&atk=gte0");
        });

        it("should handle :ritual filter", () => {
            const result = parseQuery("card :ritual");
            expect(result.options).toContain("&type=ritual%20monster");
        });

        it("should handle :synchro filter", () => {
            const result = parseQuery("card :synchro");
            expect(result.options).toContain("&type=synchro");
        });

        it("should handle :xyz filter", () => {
            const result = parseQuery("card :xyz");
            expect(result.options).toContain("&type=xyz");
        });

        it("should handle :fusion filter", () => {
            const result = parseQuery("card :fusion");
            expect(result.options).toContain("&type=fusion");
        });

        it("should handle :pendulum filter", () => {
            const result = parseQuery("card :pendulum");
            expect(result.options).toContain("&type=pendulum");
        });

        it("should handle :flip filter", () => {
            const result = parseQuery("card :flip");
            expect(result.options).toContain("&type=flip");
        });

        it("should handle :tuner filter", () => {
            const result = parseQuery("card :tuner");
            expect(result.options).toContain("tuner%20monster");
        });

        it("should return no cards on mismatching types", () => {
            const result = parseQuery("card :synchro :xyz");
            expect(result.options).toContain("&type=link%20monster&def=1");
            expect(result.options).not.toContain("synchro");
            expect(result.options).not.toContain("xyz");
        });
    });

    describe("attribute filters", () => {
        it("should handle all seven attributes", () => {
            const attributes = ["light", "dark", "water", "fire", "wind", "earth", "divine"];
            attributes.forEach((attr) => {
                const result = parseQuery(`card :${attr}`);
                expect(result.options).toBe(`&attribute=${attr}`);
            });
        });

        it("should return no cards on mismatching attributes", () => {
            const result = parseQuery("card :light :dark");
            expect(result.options).toContain("type=link%20monster&def=1");
        });
    });

    describe("monster type (race) filters", () => {
        it("should handle :winged-beast type with special encoding", () => {
            const result = parseQuery("card :winged-beast");
            expect(result.options).toBe("&race=winged%20beast");
        });

        it("should handle :sea-serpent type with special encoding", () => {
            const result = parseQuery("card :sea-serpent");
            expect(result.options).toBe("&race=sea%20serpent");
        });

        it("should handle all monster types", () => {
            const types = [
                "aqua",
                "beast",
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
                "spellcaster",
                "thunder",
                "warrior",
                "wyrm",
                "zombie",
            ];
            types.forEach((type) => {
                const result = parseQuery(`card :${type}`);
                expect(result.options).toBe(`&race=${type}`);
            });
        });
    });

    describe("numeric filters - level/rank", () => {
        it("should handle numeric filter for level (non-link monsters)", () => {
            const result = parseQuery("blue eyes :8");
            expect(result.options).toContain("&level=8");
        });

        it("should handle :0 level", () => {
            const result = parseQuery("card :0");
            expect(result.options).toContain("&level=0");
        });

        it("should handle :13 level (max level)", () => {
            const result = parseQuery("card :13");
            expect(result.options).toContain("&level=13");
        });

        it("should return no cards on mismatching level", () => {
            const result = parseQuery("card :4 :5");
            expect(result.options).toContain("&type=link%20monster&def=1");
            expect(result.options).not.toContain("&level=4");
            expect(result.options).not.toContain("&level=5");
        });
    });

    describe("numeric filters - link rating", () => {
        it("should use link filter when :link type is combined with number", () => {
            const result = parseQuery("link monster :link :2");
            expect(result.options).toContain("&type=link%20monster");
            expect(result.options).toContain("&link=2");
        });

        it("should not contain level filter when link type is used", () => {
            const result = parseQuery("link monster :link :3");
            expect(result.options).not.toContain("&level=");
            expect(result.options).toContain("&link=3");
        });
    });

    describe("ATK/DEF value filters", () => {
        it("should handle :atk filter with ATK value", () => {
            const result = parseQuery("card :atk2500");
            expect(result.options).toContain("atk=2500");
        });

        it("should handle :def filter with DEF value", () => {
            const result = parseQuery("card :def2000");
            expect(result.options).toContain("def=2000");
        });

        it("should handle :atk0", () => {
            const result = parseQuery("card :atk0");
            expect(result.options).toContain("atk=0");
        });

        it("should handle :atk?", () => {
            const result = parseQuery("card :atk?");
            expect(result.options).toContain("atk=lt0");
        });

        it("should handle :def?????", () => {
            const result = parseQuery("card :def?????");
            expect(result.options).toContain("def=lt0");
        });

        it("should handle both atk and def", () => {
            const result = parseQuery("card :def3000 :atk4000");
            expect(result.options).toContain("atk=4000");
            expect(result.options).toContain("def=3000");
        });

        it("should return no cards on mismatching atk", () => {
            const result = parseQuery("card :atk3000 :atk4000");
            expect(result.options).toContain("&type=link%20monster&def=1");
            expect(result.options).not.toContain("&atk=3000");
            expect(result.options).not.toContain("&atk=4000");
        });
    });

    describe("combined filters", () => {
        it("should combine card name with attribute and type", () => {
            const result = parseQuery("blue eyes :light :normal");
            expect(result.query).toBe("blue%20eyes");
            expect(result.options).toContain("&attribute=light");
            expect(result.options).toContain("normal%20monster");
        });

        it("should combine multiple filter types", () => {
            const result = parseQuery("synchro :synchro :light :tuner");
            expect(result.options).toContain("&attribute=light");
            expect(result.options).toContain("&type=synchro%20tuner%20monster");
        });

        it("should handle card name with type and level", () => {
            const result = parseQuery("blue eyes :monster :8");
            expect(result.query).toContain("blue%20eyes");
            expect(result.options).toContain("&level=8");
            expect(result.options).toContain("normal%20monster");
        });

        it("should handle ATK/DEF with other filters", () => {
            const result = parseQuery("card :atk2500 :effect :light");
            expect(result.options).toContain("2500");
            expect(result.options).toContain("&has_effect=1");
            expect(result.options).toContain("&attribute=light");
        });
    });

    describe("pendulum combinations", () => {
        it("should handle pendulum effect ritual combination", () => {
            const result = parseQuery("card :pendulum :ritual");
            expect(result.options).toContain("&type=pendulum%20effect%20ritual%20monster");
        });

        it("should handle pendulum flip combination", () => {
            const result = parseQuery("card :pendulum :flip");
            expect(result.options).toContain("&type=pendulum%20flip%20effect%20monster");
        });

        it("should handle pendulum synchro combination", () => {
            const result = parseQuery("card :pendulum :synchro");
            expect(result.options).toContain("&type=synchro%20pendulum%20effect%20monster");
        });

        it("should handle pendulum xyz combination", () => {
            const result = parseQuery("card :pendulum :xyz");
            expect(result.options).toContain("&type=xyz%20pendulum%20effect%20monster");
        });
    });

    describe("other combinations", () => {
        it("should handle synchro tuner combination", () => {
            const result = parseQuery("card :synchro :tuner");
            expect(result.options).toContain("&type=synchro%20tuner%20monster");
        });

        it("should handle flip tuner combination", () => {
            const result = parseQuery("card :flip :tuner");
            expect(result.options).toContain("&type=flip%20tuner%20effect%20monster");
        });

        it("should handle normal tuner combination", () => {
            const result = parseQuery("card :normal :tuner");
            expect(result.options).toContain("type=normal%20tuner%20monster");
        });

        it("should handle normal monsters", () => {
            const result = parseQuery("card :normal");
            expect(result.options).toContain("normal%20monster");
        });

        it("should handle effect monsters", () => {
            const result = parseQuery("card :effect");
            expect(result.options).toContain("&has_effect=1&atk=gte0");
        });

        it("should error on normal+effect monster", () => {
            const result = parseQuery("card :normal :effect");
            expect(result.options).toContain("&type=link%20monster&def=1");
        });
    });

    describe("spells and traps", () => {
        it("should handle continuous spells and traps", () => {
            const result = parseQuery("card :continuous");
            expect(result.options).toContain("&race=continuous");
        });

        it("should handle continuous spell cards", () => {
            const result = parseQuery("card :spell :continuous");
            expect(result.options).toContain("&type=spell%20card");
            expect(result.options).toContain("&race=continuous");
        });

        it("should handle normal spell cards", () => {
            const result = parseQuery("card :spell :normal");
            expect(result.options).toContain("&type=spell%20card");
            expect(result.options).toContain("&race=normal");
        });

        it("should handle normal trap cards", () => {
            const result = parseQuery("card :trap :normal");
            expect(result.options).toContain("&type=trap%20card");
            expect(result.options).toContain("&race=normal");
        });

        it("should handle ritual spell cards", () => {
            const result = parseQuery("card :spell :ritual");
            expect(result.options).toContain("&type=spell%20card");
            expect(result.options).toContain("&race=ritual");
        });
    });

    describe("edge cases", () => {
        it("should handle effect without normal", () => {
            const result = parseQuery("card :effect");
            expect(result.options).toContain("&has_effect=1");
        });

        it("should handle normal and effect together (no results for monsters)", () => {
            const result = parseQuery("card :normal :effect");
            expect(result.options).toContain("&type=link%20monster&def=1");
        });

        it("should handle normal and effect together (spell/trap)", () => {
            const result = parseQuery("card :normal :effect :spell");
            expect(result.options).toContain("&type=spell%20card");
            expect(result.options).toContain("&race=normal");
            expect(result.options).not.toContain("&type=link%20monster&def=1");
        });
    });
});
