# Yu-Gi-Oh! Card Searcher Plugin for Flow Launcher

This is a plugin for [Flow Launcher](https://www.flowlauncher.com) that searches [ygoprodeck.com](https://ygoprodeck.com) for cards.

![readme3](https://github.com/pivotiiii/flow_launcher_ygo/assets/17112987/b761c97f-1ee5-4c0b-8d1b-6054552d1116)

## Installation

This plugin can be installed using the Flow Launcher Plugin Store or directly from the Flow Launcher search bar by entering

`pm install Yu-Gi-Oh! Card Search`

## Usage

The default keyword is `ygo`. Card results can be filtered by entering a colon `:` followed by a card type, monster type, attribute, level or ATK/DEF value.

The possible filter keywords are:

| Keyword | Possible Values |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:{level/rank/link rating}` | any number from `:0` to `:13` |
| `:{card_type}`              | `:spell`, `:trap`, `:monster`, `:normal`, `:effect`, `:ritual`, `:synchro`, `:xyz`, `:fusion`, `:link`, `:pendulum`, `:flip`, `:tuner`, `:union`, `:gemini`, `:spirit`, `:toon` |
| `:{monster_attribute}`      | `:light`, `:dark`, `:water`, `:fire`, `:wind`, `:earth`, `:divine` |
| `:{monster_type}`           | `:aqua`, `:beast`, `:beast-warrior`, `:cyberse`, `:dinosaur`, `:divine-beast`, `:dragon`, `:fairy`, `:fiend`, `:fish`, `:insect`, `:machine`, `:plant`, `:psychic`, `:pyro`, `:reptile`, `:rock`, `:sea-serpent`, `:spellcaster`, `:thunder`, `:warrior`, `:winged-beast`, `:wyrm`, `:zombie` |
|`:{spell_type}`|`normal`, `continuous`, `quick-play`, `field`, `equip`, `ritual`|
|`:{trap_type}`|`normal`, `continuous`, `counter`|
| `:atk{atk_value}` | any non-negative number or `?`, e.g. `:atk2300` or `:atk4000` or `:atk?` |
| `:def{def_value}` | any non-negative number or `?`, e.g. `:def2000` or `:def0` or `def???` |

- All filter values are case insensitive. 
- Card type filters can be combined to further narrow down the search results. 
- To search for normal spells/traps or ritual spells you need to use `:spell :normal`, `:trap :normal` and `:spell :ritual` since `:normal` and `:ritual` search for the corresponding monster type otherwise.

![readme2](https://github.com/pivotiiii/flow_launcher_ygo/assets/17112987/09916600-13a8-440d-bf75-b90fbb369997)

Available meta commands are:

| Keyword  | Explanation                               |
| -------- | ----------------------------------------- |
| `:help`  | Open this README page.                    |
| `:cache` | Open or delete the image cache directory. |

Images for the search preview are cached to prevent excessive load on the ygoprodeck API :)

The cached image sizes scale with resolution, e.g. on a 1080p display each image is around 6kB in size, on a 4k display each image is around 22kB. If you were to search for all 12,637 currently available cards, the cache would have a size of around 76MB on 1080p or 278MB on 4k.
