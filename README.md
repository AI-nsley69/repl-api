# repl-api
An express nodejs app running on repl.it to serve as an api endpoint for my own usecases.

## /dislyte/esper/$NAME
Fetches an esper's information
```json
{
  "name": "Ophelia (Thanatos)",
  "rarity": "Legendary",
  "role": "Fighter",
  "attribute": {
    "name": "Wind",
    "icon": "https://static.wikia.nocookie.net/dislyte/images/0/06/Wind-icon.png",
    "color": 1897411
  },
  "artwork": "https://static.wikia.nocookie.net/dislyte/images/a/a6/Ophelia_sprite.png/revision/latest?cb=20220726070103",
  "icon": "https://gachax.com/dislyte/wp-content/uploads/sites/13/2022/08/ophelia-icon.jpg",
  "url": "https://dislyte.fandom.com/wiki/Ophelia_(Thanatos)",
  "age": "32",
  "height": "175cm",
  "affiliation": "Icon",
  "identity": "Shadow Guard",
  "preference": "Origami",
  "stats": {
    "hp": "12588",
    "atk": "1244",
    "def": "811",
    "speed": "97"
  },
  "skills": [
    {
      "name": "Elegant Strike",
      "value": "Attacks 1 enemies. Deals 130% ATK damage. Inflicts Bleed for 2 turns."
    },
    {
      "name": "Heartless Reaper",
      "value": "Attacks 1 enemy. Deals 180% ATK damage. Each buff on Thanatos and each debuff on the enemy increases damage by 10%, up to 100%. Heals Thanatos by 20% of damage dealt. Gains 1 turn upon killing the enemy. Cooldown: 3 turns."
    },
    {
      "name": "Butterfly Dreams,Ascension",
      "value": "Attacks 1 enemy. Deals 270% ATK damage. Cast Elegant Strike to perform pursuit attacks equal to the total number of one's own buffs and the enemy's debuffs. If the enemy dies during the pursuit attacks, continues to attack another enemy, up to 3 times. Pursuit damage on the same target is gradually reduced by 20% with each hit. This ability and it's pursuit attacks inflict DEF Down for 2 turns on the first hit of each new target. Cooldown: 3 turns."
    },
    {
      "name": "Captain",
      "value": "Increases ally C. RATE in Point War by 30%"
    }
  ],
  "relics": {
    "una": "War Machine/Hammer of Thor/Wind Walker",
    "mui": "Fiery Incandescence"
  },
  "main_stats": {
    "una2": "C. DMG/C. RATE",
    "una4": "ATK Bonus (ATK%)",
    "mui2": "SPD/ATK Bonus (ATK%)"
  },
  "credits": [
    "https://gachax.com/dislyte/characters/",
    "https://dislyte.fandom.com/wiki/Espers",
    "https://docs.google.com/spreadsheets/u/1/d/15hc3Nx6TDS7BNAIXid0gNO1j7gcVeydNoLwyY4POtzc/htmlview#"
  ]
}
```

Due to inconsistencies with the wiki, `skills` object may return undefined, include the ability upgrade levels info or be incorrect. Certain data like affiliation may be parsed incorrectly and return "Icon". Age, height, Affiliation, Identity & Preference may return as "Unknown".

If an esper is not found, it will simply set the status code to 404 and return the error given by nodejs.
