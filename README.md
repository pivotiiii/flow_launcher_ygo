# Yu-Gi-Oh! Card Searcher Plugin for Flow Launcher

This is a plugin for [Flow Launcher](https://www.flowlauncher.com) that searches [ygoprodeck.com](https://ygoprodeck.com) for cards.

![readme1](https://github.com/pivotiiii/flow_launcher_ygo/assets/17112987/7f965228-12bd-4c4a-b874-6a6799494964)

## Installation

This plugin can be installed using the Flow Launcher Plugin Store or directly from the Flow Launcher search bar by entering 

`pm install XXX`

## Usage

The default keyword is `ygo`. Card results can be filtered by entering a colon `:` followed by a card type, monster type, attribute, level or ATK/DEF value.

The possible filter keywords are:

| Keyword | Possible Values |
| --- | --- |
| `:{level/rank/link rating}` | any number from `:0` to `:13` |
| `:{card_type}` | `:spell`, `:trap`, `:monster`, `:normal`, `:effect`, `:ritual`, `:synchro`, `:xyz`, `:fusion`, `:link`, `:pendulum`, `:flip`, `:tuner`, `:union`, `:gemini`, `:spirit`, `:toon` |
| `:{monster_attribute}` | `:light`, `:dark`, `:water`, `:fire`, `:wind`, `:earth`, `:divine` |
| `:{monster_type}` | `:aqua`, `:beast`, `:beast-warrior`, `:cyberse`, `:dinosaur`, `:divine-beast`, `:dragon`, `:fairy`, `:fiend`, `:fish`, `:insect`, `:machine`, `:plant`, `:psychic`, `:pyro`, `:reptile`, `:rock`, `:sea-serpent`, `:spellcaster`, `:thunder`, `:warrior`, `:winged-beast`, `:wyrm`, `:zombie` |
| `:atk{atk_value}` | any non-negative number, e.g. `:atk2300` or `:atk4000` |
| `:def{def_value}` | any non-negative number, e.g. `:def2000` or `:def0` |

All filter values are case insensitive. Card type filters can be combined to further narrow down the search results.

![readme2](https://github.com/pivotiiii/flow_launcher_ygo/assets/17112987/09916600-13a8-440d-bf75-b90fbb369997)

Available meta commands are:

| Keyword | Explanation |
| --- | --- |
| `:help` | Open this README page. |
| `:cache` | Open or delete the image cache directory. |

Images for the search preview are cached to prevent excessive load on the ygoprodeck API :)

The cached image sizes scale with resolution, e.g. on a 1080p display each image is around 6kB in size, on a 4k display each image is around 22kB. If you were to search for all 12,637 currently available cards, the cache would have a size of around 76MB on 1080p or 278MB on 4k.
