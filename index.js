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

        app.get("/reviews", (req, res) => {
            res.send("This is reviews API");
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
            const result = await users.insertOne(data);
            res.send(result);
        });
        // Update users Info
        app.put("/users/:id", async (req, res) => {
            const id = req.params.id;
            const { photoUrl, displayName, email } = req.body;
            const filter = { _id: new ObjectId(id) };
            let updateData = {};

            // Check whitch field is true
            photoUrl
                ? displayName // photoUrl = true
                    ? email // displayName = true
                        ? // email = ture
                          (updateData = {
                              $set: {
                                  photoUrl,
                                  displayName,
                                  email,
                              },
                          })
                        : // email = false
                          (updateData = {
                              $set: {
                                  photoUrl,
                                  displayName,
                              },
                          })
                    : email // displayName = false
                    ? // email = true
                      (updateData = {
                          $set: {
                              photoUrl,
                              email,
                          },
                      })
                    : // email =  false
                      (updateData = {
                          $set: {
                              photoUrl,
                          },
                      })
                : displayName // photoUrl = false
                ? email // displayName = true
                    ? // email =  true
                      (updateData = {
                          $set: {
                              displayName,
                              email,
                          },
                      })
                    : // email = false
                      (updateData = {
                          $set: {
                              displayName,
                          },
                      })
                : email // displayName = false
                ? // email = true
                  (updateData = {
                      $set: {
                          email,
                      },
                  })
                : (updateData = { empty: "empty" }); // email = false

            // Check updateData
            if (updateData.empty === "empty") {
                return res.send({ error: "Couldn't Update Data" });
            } else {
                const result = await users.updateOne(filter, updateData);
                return res.send(result);
            }
        });

        // Delete an User
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await users.deleteOne(query);
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
