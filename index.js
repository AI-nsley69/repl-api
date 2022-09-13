const express = require("express");
const app = express();
const espers = require("./api/espers.js");
let sheet;

const PORT = 443;
app.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);
    sheet = await espers.prepareDoc();
    console.log("Finished loading sheet");
})

app.get("/", (req, res) => {
    res.send("Available endpoints: /dislyte/esper/$ESPER_NAME")
})

app.get("/dislyte/esper/:esper", async (req, res) => {
    try {
        const esper = req.params.esper;
        let esperInfo;
        esperInfo = await espers.getData(esper, sheet)
        res.json(esperInfo);
    } catch (err) {
        console.log(err);
        res.status(404);
        res.json({ error: err.toString() });
    }
})