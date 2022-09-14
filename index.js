const express = require("express");
const app = express();
const espers = require("./api/espers.js");

// Wrap in an async main function to await the async functions
async function main() {
    // Pre start data
    await espers.prepareDoc();
    console.log("Finished loading sheet");
    await espers.indexEsper();
    console.log("Finished indexing espers");
    await espers.preCache();
    console.log("Started pre-caching known espers");
    // Start express
    const PORT = 443;
    app.listen(PORT,  () => {
        console.log(`Listening on port ${PORT}`);
    })
    
    app.get("/", (req, res) => {
        res.send("Available endpoints: /dislyte/esper/$ESPER_NAME")
    })
    
    app.get("/dislyte/esper/:esper", async (req, res) => {
        try {
            const esper = req.params.esper;
            let esperInfo;
            esperInfo = await espers.getData(esper)
            res.json(esperInfo);
        } catch (err) {
            console.log(err);
            res.status(404);
            res.json({ error: err.toString() });
        }
    })
}

main();