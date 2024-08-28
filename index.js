const express = require("express");
const path = require("path");
const process = require('./service/readFile')

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static( path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/process", async (req, res) => {
    const { source, destination } = req.body;

    try{
        await process(source, destination);

        // Trả về kết quả dưới dạng JSON
        res.status(200).json({
            success: true,
        });
    }catch (err){
        // Trả về kết quả dưới dạng JSON
        res.status(401).json({
            success: false,
        });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});