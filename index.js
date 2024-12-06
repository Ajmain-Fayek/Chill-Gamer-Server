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
        // Get All reviews
        app.get("/reviews", async (req, res) => {
            const result = await reviews.find({}).toArray();
            if (Object.keys(result).length === 0) {
                return res.status(404).json({ error: "No Data Found" });
            }
            res.status(200).json({
                message: `Reviews Found = ${result.length}`,
                result,
            });
        });

        // My reviews
        app.get("/reviews/search", async (req, res) => {
            // console.log("first");
            const { query } = req.query;
            if (
                typeof query === "string" &&
                query.trim() !== "" &&
                isNaN(query)
            ) {
                const email = query.trim();
                if (email.length === 0) {
                    return res
                        .status(400)
                        .json({ error: "No valid Email Found" });
                }
                const result = await reviews.find({ email }).toArray();

                if (Object.keys(result).length === 0) {
                    return res.status(404).json({ error: "No Reviews Found" });
                }

                return res.status(200).json({
                    message: `Reviews Found = ${result.length}`,
                    result,
                });
            } else {
                return res.status(400).json({ error: "No valid Email Found" });
            }
        });

        // Get a Single Review
        app.get("/reviews/:id", async (req, res) => {
            // console.log("first")
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res
                    .status(400)
                    .json({ error: "Invalid Review ID Format" });
            }
            const query = { _id: new ObjectId(id) };
            const result = await reviews.findOne(query);
            if (Object.keys(result).length === 0) {
                return res.status(404).json({ error: "No Data Found" });
            }
            res.status(200).json({
                message: `Reviews Found = ${result.title}`,
                result,
            });
        });

        // Add review
        app.post("/reviews", async (req, res) => {
            const data = req.body;
            const addReviews = {};

            // Validate Data
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === "string" && value.trim() !== "") {
                    addReviews[key] = value.trim();
                } else if (typeof value === "number" && !isNaN(value)) {
                    addReviews[key] === value;
                }
            }

            // Check if addReviews is Empty
            if (Object.keys(addReviews).length === 0) {
                return res.status(400).json({ error: "No valid field found" });
            }

            const result = await reviews.insertOne(addReviews);
            res.status(200).json({
                message: "Reviews added successfully",
                result,
            });
        });

        // Update review
        app.put("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res
                    .status(400)
                    .json({ error: "Invalid Review ID Format" });
            }
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            let updateReviews = {};

            // data validation
            // Check whitch field is true
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === "string" && value.trim() !== "") {
                    updateReviews[key] = value.trim();
                } else if (typeof value === "number" && !isNaN(value)) {
                    updateReviews[key] = value;
                }
            }

            // Check if updateData is empty
            if (Object.keys(updateReviews).length === 0) {
                return res.status(400).json({ error: "No Valid Field Found" });
            }

            const result = await reviews.updateOne(
                filter,
                {
                    $set: updateReviews,
                },
                { upsert: true }
            );
            res.status(200).json({
                message: "Review Updated Successfully",
                result,
            });
        });

        //  Delete review
        app.delete("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res
                    .status(400)
                    .json({ error: "Invalid Review ID Format" });
            }

            const query = { _id: new ObjectId(id) };
            const reviewExist = await reviews.findOne(query);

            if (!reviewExist) {
                return res.status(404).json({ message: "Review Not Found" });
            }

            const result = await reviews.deleteOne(query);
            res.status(200).json({
                message: "Review Deleted Successfully",
                result,
            });
        });

        // --------------------------------------------------
        // USERS RELATED API"S                             //
        // --------------------------------------------------
        // Get all Users
        app.get("/users", async (req, res) => {
            const result = await users.find({}).toArray();
            if (Object.keys(result).length === 0) {
                return res.status(404).json({ error: "No Data Found" });
            }
            res.status(200).json({
                message: `Users Found = ${result.length}`,
                result,
            });
        });

        // Get signle User
        app.get("/users/search", async (req, res) => {
            const { email } = req.query;
            const query = {
                email: email.trim(),
            };
            const result = await users.findOne(query);
            if (!result) {
                return res.status(404).json({ error: "User Not Found" });
            }
            if (Object.keys(result).length === 0) {
                return res.status(404).json({ error: "User Not Found" });
            }
            res.status(200).json(result);
        });

        // My Watch List
        app.get("/users/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            if (!ObjectId.isValid(id)) {
                return res
                    .status(400)
                    .json({ error: "Invalid User ID Format" });
            }
            const query = { _id: new ObjectId(id) };

            //Find watchList ID's from User data
            const listOfWatchlist = await users.findOne(query, {
                projection: { _id: 0, watchList: 1 },
            });

            if (Object.keys(listOfWatchlist).length === 0) {
                return res.status(404).json({ error: "No Watchlist Found" });
            }

            // New query to find Detailed Data
            const newQuery = listOfWatchlist.watchList.map(
                (id) => new ObjectId(id)
            );

            const result = await reviews
                .find({ _id: { $in: newQuery } })
                .toArray();
            res.status(200).json({
                message: `Reviews Found = ${result.length}`,
                result,
            });
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
                    .status(400)
                    .json({ error: "No Valid Fields Provided" });
            }

            const userExist = await users.findOne({ email: addUser?.email });
            if (userExist) {
                return res.status(202).json({ message: "User Already Exists" });
            }

            const result = await users.insertOne(addUser);
            res.status(200).json({
                message: "User Added Successfully",
                result,
            });
        });

        // Update users Info
        app.put("/users/:id", async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res
                    .status(400)
                    .json({ error: "Invalid User ID Format" });
            }
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
                return res.status(400).json({ error: "No Valid Field Found" });
            }

            const result = await users.updateOne(
                filter,
                {
                    $set: updateData,
                },
                { upsert: true }
            );
            res.status(200).json({
                message: "User Updated Successfully",
                result,
            });
        });

        // Add Watchlist
        app.patch("/users/:id", async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res
                    .status(400)
                    .json({ error: "Invalid User ID Format" });
            }
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            let updateWatchlist = {};

            // data validation
            // Check whitch field is true
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === "string" && value.trim() !== "") {
                    updateWatchlist[key] = value.trim();
                } else if (typeof value === "number" && !isNaN(value)) {
                    updateWatchlist[key] = value;
                }
            }

            // Check if updateWatchlist is empty
            if (Object.keys(updateWatchlist).length === 0) {
                return res
                    .status(400)
                    .json({ error: "No Valid review ID Found" });
            }
            // console.log(updateWatchlist.watchList);

            const WatchList = await users.findOne(filter);
            if (WatchList?.watchList?.includes(updateWatchlist.watchList)) {
                return res
                    .status(202)
                    .json({ message: "Watchlist Already Exist" });
            }
            if (WatchList.watchList) {
                const result = await users.updateOne(filter, {
                    $set: {
                        watchList: [
                            ...WatchList.watchList,
                            updateWatchlist.watchList,
                        ],
                    },
                });
                return res.status(200).json({
                    message: "WatchList Added Successfully",
                    result,
                });
            }
            const result = await users.updateOne(
                filter,
                {
                    $set: { watchList: [updateWatchlist.watchList] },
                },
                { upsert: true }
            );
            res.status(200).json({
                message: "WatchList Added Successfully",
                result,
            });
        });

        // Delete Watch List
        app.delete("/watchlist/:userId/:itemId", async (req, res) => {
            const { userId, itemId } = req.params;

            try {
                const result = await users.updateOne(
                    { _id: new ObjectId(userId) },
                    { $pull: { watchList: itemId } } // $pull removes the item from the watchList array
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                res.send({ message: "Item removed successfully" });
            } catch (error) {
                // console.error(error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        // Delete an User
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            if (!ObjectId.isValid(id)) {
                return res
                    .status(400)
                    .json({ error: "Invalid User ID Format" });
            }

            const query = { _id: new ObjectId(id) };
            const userExist = await users.findOne(query);

            if (!userExist) {
                return res.status(404).json({ errpr: "User Not Found" });
            }

            const result = await users.deleteOne(query);
            res.status(200).json({
                message: "User Deleted Successfully",
                result,
            });
        });
    } catch (err) {
        console.log(err);
    }
};
chillGamer();

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Chill Gamer. A Game Review Application API's",
        Url: "https://chill-gamer-7f9f1.web.app",
    });
});
app.listen(port, () => {
    console.log("Chill Gamer listening: ", port);
});
