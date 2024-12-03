require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path')
const favicon = require("serve-favicon");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 8800;
const app = express();

app.use(favicon(path.join(__dirname, "public", "favicon.png")));
app.use(cors());
app.use(express.json());

const uri = process.env.URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

chillGamer = async () => {
    try {
        /**
         * Connect to the "chill_gamer" database
         * and access the required collections
         */
        const database = client.db("chill_gamer");
        const users = database.collection("users");
        const games = database.collection("games");

        app.get("/games", (req, res) => {
            res.send("This is games API");
        });
        app.get("/users", (req, res) => {
            res.send("This is Users API");
        });

        app.post("/users", async (req, res) => {
            const data = req.body;
            const result = await users.insertOne(data);
            res.send(result);
        });

        /**
         * Send a ping to cinfirm a successful connection
         * comment it when deplyoing into Vercel
         */
        // await client.db("chill_gamer").command({ ping: 1 });
        // console.log(
        //     "Pinged your deployment. You successfully connected to MongoDB"
        // );
    } catch {
        console.dir;
    }
};
chillGamer();

app.get("/", (req, res) => {
    res.send("Welcome to Chill Gamer. A Game Review Application");
});
app.listen(port, () => {
    console.log("Chill Gamer listening: ", port);
});
