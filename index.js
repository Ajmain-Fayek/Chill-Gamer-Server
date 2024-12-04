require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const favicon = require("serve-favicon");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        const reviews = database.collection("reviews");

        // --------------------------------------------------
        // REVIEWS RELATED API"S                           //
        // --------------------------------------------------
        app.get("/reviews", async (req, res) => {
            const data = await reviews.find({}).toArray();
            res.send(data);
        });

        app.post("/reviews", async (req, res) => {
            const data = req.body;
            const result = await reviews.insertOne(data);
            res.send(result);
        });

        app.put("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const {} = req.body;
        });

        // --------------------------------------------------
        // USERS RELATED API"S                             //
        // --------------------------------------------------
        app.get("/users", async (req, res) => {
            const result = await users.find({}).toArray();
            res.send(result);
        });

        //  Create a user
        app.post("/users", async (req, res) => {
            const data = req.body;
            const addUser = {};

            // data validation
            // Check  whitch field is true
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === "string" && value.trim() !== "") {
                    // Only take none empty values to update addUser
                    addUser[key] = value.trim(); // remove any white space from start or ending of the string
                } else if (typeof value === "number" && !isNaN(value)) {
                    addUser[key] = value; // if value is a number then add it into the addUser
                }
            }

            // Check if the addUser is empty
            if (Object.keys(addUser).length === 0) {
                return res
                    .status(404)
                    .json({ error: "No Valid User Data Found" });
            }

            const result = await users.insertOne(addUser);
            res.send(result);
        });

        // Update users Info
        app.put("/users/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            let updateData = {};

            // data validation
            // Check whitch field is true
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === "string" && value.trim() !== "") {
                    updateData[key] = value.trim();
                } else if (typeof value === "number" && !isNaN(value)) {
                    updateData[key] = value;
                }
            }

            // Check if updateData is empty
            if (Object.keys(updateData).length === 0) {
                return res.status(404).json({ error: "No Valid Data Found" });
            }

            const result = await users.updateOne(filter, {
                $set: updateData,
            });
            res.send(result);
        });

        // Delete an User
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await users.deleteOne(query);
            res.send(result);
        });
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
