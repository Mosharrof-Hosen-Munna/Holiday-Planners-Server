const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

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
    const reviewCollection = database.collection("reviews");

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

    app.get("/api/bookingOrders/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };

      const cursor = bookingOrderCollection.find(query);

      if ((await cursor.count()) === 0) {
        return res.json([]);
      }

      const result = await cursor.toArray();
      res.send(result.reverse());
    });

    app.get("/api/bookingOrder/all", async (req, res) => {
      const cursor = bookingOrderCollection.find({});

      const allOrders = await cursor.toArray();
      res.json(allOrders.reverse());
    });

    app.get("/api/booking/order/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };

      const result = await bookingOrderCollection.findOne(query);
      res.send(result);
    });

    app.get("/api/review/all", async (req, res) => {
      const cursor = reviewCollection.find({});

      const allReview = await cursor.toArray();
      res.send(allReview.reverse());
    });

    // POST API

    // POST API FOR CREATE DESTINATION
    app.post("/create/travelDestinations", async (req, res) => {
      const destinationData = req.body;

      const result = await travelCollection.insertOne(destinationData);
      res.json(result);
    });

    // Create Travel Booking

    app.post("/api/booking/newOrder", async (req, res) => {
      const {
        price,
        place,
        email,
        uid,
        phone,
        paymentMethod,
        message,
        status,
        author,
      } = req.body;

      const bookingData = {
        uid,
        email,
        phone,
        paymentMethod,
        message,
        status,
        price,
        place,
        date: new Date().toDateString(),
        author,
      };
      const Result = await bookingOrderCollection.insertOne(bookingData);

      res.json(Result);
    });

    // create review post
    app.post("/api/review/create", async (req, res) => {
      const { orderID, email, name, photo, rating, message, uid } = req.body;

      const reviewData = {
        email,
        name,
        photo,
        rating,
        message,
        orderID,
        uid,
      };

      const result = await reviewCollection.insertOne(reviewData);
      res.json(result);
    });

    // DELETE API
    app.delete("/api/order/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingOrderCollection.deleteOne(query);

      res.json(result);
    });

    // Update Api

    // update order status pending to approved

    app.put("/api/order/update/status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await bookingOrderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/api/order/cancel/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };

      const updateDoc = {
        $set: {
          status: "Cancelled",
        },
      };
      const options = { upsert: true };

      const result = await bookingOrderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
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
