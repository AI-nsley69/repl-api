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

const unknownStats = {
  hp: "Unknown",
  atk: "Unknown",
  def: "Unknown",
  speed: "Unknown"
}

const credits = [
  "https://gachax.com/dislyte/characters/",
  "https://dislyte.fandom.com/wiki/Espers",
  "https://docs.google.com/spreadsheets/u/1/d/15hc3Nx6TDS7BNAIXid0gNO1j7gcVeydNoLwyY4POtzc/htmlview#"
];

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
    const search = await wiki.search(esper);
    const isValidEsper = search.results.length > 0;
    if (isValidEsper) throw "Invalid esper!";

    const esperFromResult = esperFromResult;

    const isInCache = esperCache.has(esperFromResult);
    if (isInCache) return esperCache.get(esperFromResult);
    const esperPage = await wiki.page(esperFromResult);

    const esperName = esperFromResult.split(" (")[0];
    const esperObj = espers.filter(e => e.name === esperName)[0];

    const pageInfo = await esperPage.fullInfo();
    const raw = await esperPage.rawInfo();

    const { attribute, affiliation, role, rarity } = getFromRaw(raw);
    const { age, height, preference, identity } = pageInfo.general;
    
    const skills = await getSkills(esperPage);

    let esperInfo = {
      name: esperFromResult,
      rarity: rarity,
      role: role,
      attribute: {
        name: attribute,
        icon: attributes.icons[attribute],
        color: attributes.colors[attribute]
      },
      artwork: await esperPage.mainImage(),
      icon: esperObj.icon,
      url: esperPage.url(),
      age: age,
      height: height,
      affiliation:  affiliation,
      identity: identity,
      preference: preference,
      stats: esperObj.stats,
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
      credits: credits,
    }

    getRelics(esperInfo);

    replaceUndefinedFields(esperInfo);

    esperCache.set(esperFromResult, esperInfo);
    return esperInfo;
  }
}

function getFromRaw(raw) {
  return {
    attribute: raw.match(/attribute=\{\{Icon\|([a-zA-Z]+)\}/)[1],
    affiliation: pageInfo.general.affiliation || raw.match(/affiliation=\{\{Icon\|([a-z A-Z]+)\}\}/)[1],
    role: pageInfo.general.role || raw.match(/role=([a-zA-Z]+)/)[1],
    rarity: raw.match(/rarity=\{\{Icon\|([a-zA-Z]+)\}/)[1],
  }
}

async function getSkills(esperPage) {
  let skills = await esperPage.tables().then(r => r[0]);
  try {
    skills = skills.filter(s => s.name);

    skills.forEach(obj => {
      delete obj.ability;
      if (obj.description) obj.description = obj.description.toString();

      removeHtmlTags(obj);

      obj.description = obj.description.split(",•Icon");
      if (obj.description.length > 1) obj.description.pop();
      obj.description = obj.description.toString();
      
      obj.value = obj.description;
      delete obj.description;
      
    })
  } catch (err) {
    skills = undefined;
  }

  return skills
}

function removeHtmlTags(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];

    obj[key] = value.replace(/(<([^>]+)>)/ig, '');
  }
}

function getRelics(esperInfo) {
    // Position for the information
    // Position for the information
    const colIndex = {
      name: 2,
      una: 5,
      mui: 6,
  }
  const i = esperIndex[esperName]
  if (i) {
  Object.keys(esperInfo.relics).forEach(k => {
    esperInfo.relics[k] = sheet.getCell(i, colIndex[k]).value.replaceAll("\n", "/");
  })
    
  Object.keys(esperInfo.main_stats).forEach((k, index) => {
    const pos = colIndex.mui + index + 1;
      esperInfo.main_stats[k] = sheet.getCell(i, pos).value.replaceAll("\n", "/");
    })
  }
}

function replaceUndefinedFields(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];

    if (!value) obj[key] = 'Unknown';
  }
}