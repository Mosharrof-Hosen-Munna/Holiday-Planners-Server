const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project.wytfk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("HolidayPlanners");
    const travelCollection = database.collection("festivalDestinations");
    const bookingOrderCollection = database.collection("bookingOrder");

    // GET API

    app.get("/travelDestination/all", async (req, res) => {
      const cursor = travelCollection.find({});

      const travelDestinations = await cursor.toArray();
      res.send(travelDestinations);
    });

    app.get("/travelDestination/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await travelCollection.findOne(query);
      res.send(result);
    });

    // POST API

    // POST API FOR CREATE DESTINATION
    app.post("/create/travelDestinations", async (req, res) => {
      const destinationData = req.body;

      const result = await travelCollection.insertOne(destinationData);
      res.json(result);
    });
  } finally {
    // await client.close()
  }
};
run().catch(console.dir);

app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});
