// MediaWiki API
const wikijs = require('wikijs').default;
var wiki = wikijs({
  apiUrl: "https://dislyte.fandom.com/api.php",
  origin: null
});
// Google Spreadsheet API
const { GoogleSpreadsheet } = require('google-spreadsheet');
let sheet;
// Cache
const NodeCache = require("node-cache");
const esperCache = new NodeCache({
  stdTTL: 7 * 24 * 60 * 60 // Time to live: one week
})

const esperIndex = {};

// Espers JSON
const espers = JSON.parse(require("fs").readFileSync("./assets/espers.json"));

const attributes = {
  icons: {
    Shimmer: "https://static.wikia.nocookie.net/dislyte/images/b/b4/Shimmer-icon.png",
    Inferno: "https://static.wikia.nocookie.net/dislyte/images/5/5a/Inferno-icon.png",
    Flow: "https://static.wikia.nocookie.net/dislyte/images/3/33/Flow-icon.png",
    Wind: "https://static.wikia.nocookie.net/dislyte/images/0/06/Wind-icon.png",
  },
  colors: {
    Shimmer: 0xacefed,
    Inferno: 0xfc8c04,
    Flow: 0xdb7bfb,
    Wind: 0x1cf3c3
  }
}

module.exports = {
  async prepareDoc() {
    const doc = new GoogleSpreadsheet('15hc3Nx6TDS7BNAIXid0gNO1j7gcVeydNoLwyY4POtzc');
    await doc.useServiceAccountAuth({
      client_email: process.env.client_email,
      private_key: process.env.private_key.replace(/\\n/g, "\n")
    });

    await doc.loadInfo();

    sheet = doc.sheetsByTitle['Esper Info'];
    await sheet.loadCells();
  },
   indexEsper() {
      const nameIndex = 2;
      for (let i = 2; i < sheet.rowCount - 1; i++) {
        const name = sheet.getCell(i, nameIndex).value;
        esperIndex[name] = i;
      }
  },
   preCache() {
    Object.keys(esperIndex).forEach(async k => {
        await this.getData(k).catch(err => console.log(err.toString()));
    })
  },
  async getData(esper) {
    // Else start processing it
    const search = await wiki.search(esper);
    if (search.results.length < 1) throw "Invalid esper!";
    // Check if esper is in cache
    if (esperCache.has(search.results[0])) return esperCache.get(search.results[0]);
    const esperPage = await wiki.page(search.results[0]);
    // Fetch object from esper name
    const esperName = search.results[0].split(" (")[0];
    const esperObj = espers.filter(e => e.name === esperName)[0];
    // Get full & raw info to extract as much data as possible
    const pageInfo = await esperPage.fullInfo();
    const raw = await esperPage.rawInfo();
    const attribute = raw.match(/attribute=\{\{Icon\|([a-zA-Z]+)\}/)[1];
    // Get some extra data
    const { age, height, preference, identity } = pageInfo.general;

    const affiliation = pageInfo.general.affiliation || raw.match(/affiliation=\{\{Icon\|([a-z A-Z]+)\}\}/)[1];
    const role = pageInfo.general.role || raw.match(/role=([a-zA-Z]+)/)[1];
    // Skills
    let skills = await esperPage.tables().then(r => r[0]);
    try {
      skills = skills.filter(s => s.name);
      // Delete unneccesary data
      skills.forEach(obj => {
        delete obj.ability;
        if (obj.description) obj.description = obj.description.toString();
        // Remove html tags
        Object.keys(obj).forEach(k => {
          const v = obj[k];
          obj[k] = v.replace(/(<([^>]+)>)/ig, '');
        })
        // Remove icons
        obj.description = obj.description.split(",•Icon");
        if (obj.description.length > 1) obj.description.pop();
        obj.description = obj.description.toString();
        // Rename description to value
        obj.value = obj.description;
        delete obj.description;
        // Set captain ability to none if it doesn't exist
      })
    } catch (err) {
      skills = undefined;
    }

    const unknownStats = {
      hp: "Unknown",
      atk: "Unknown",
      def: "Unknown",
      speed: "Unknown"
    }

    let esperInfo = {
      name: search.results[0],
      rarity: raw.match(/rarity=\{\{Icon\|([a-zA-Z]+)\}/)[1] || "Unknown",
      role: role,
      attribute: {
        name: attribute,
        icon: attributes.icons[attribute],
        color: attributes.colors[attribute]
      },
      artwork: await esperPage.mainImage(),
      icon: esperObj.icon,
      url: esperPage.url(),
      age: age ? age : "Unknown",
      height: height ? height : "Unknown",
      affiliation:  affiliation,
      identity: identity ? identity : "Unknown",
      preference: preference ? preference : "Unknown",
      stats: esperObj.stats ? esperObj.stats : unknownStats,
      skills: skills,
      relics: {
        una: "Unknown",
        mui: "Unknown",
      },
      main_stats: {
        una2: "Unknown",
        una4: "Unknown",
        mui2: "Unknown",
      },
      credits: [
        "https://gachax.com/dislyte/characters/",
        "https://dislyte.fandom.com/wiki/Espers",
        "https://docs.google.com/spreadsheets/u/1/d/15hc3Nx6TDS7BNAIXid0gNO1j7gcVeydNoLwyY4POtzc/htmlview#"
      ]
    }
    // Position for the information
    // Position for the information
    const colIndex = {
        name: 2,
        una: 5,
        mui: 6,
    }
      const i = esperIndex[esperName]
      // Get the recommended relics
      if (i) {
      Object.keys(esperInfo.relics).forEach(k => {
        esperInfo.relics[k] = sheet.getCell(i, colIndex[k]).value.replaceAll("\n", "/");
      })
      // Get each recommended main stat
      Object.keys(esperInfo.main_stats).forEach((k, index) => {
        const pos = colIndex.mui + index + 1;
        esperInfo.main_stats[k] = sheet.getCell(i, pos).value.replaceAll("\n", "/");
      })
    }
    // Add the info to cache
    esperCache.set(search.results[0], esperInfo);
    return esperInfo;
  }
}