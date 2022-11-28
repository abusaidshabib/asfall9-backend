const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d1gdkts.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const carsCollection = client.db('asfall9').collection('carsdata');
    const bookingsCollection = client.db('asfall9').collection('bookings');
    const userCollection = client.db('asfall9').collection('user');
    const categorie = client.db('asfall9').collection('category');

    app.get('/carsdata', async (req, res) => {
      let query = {};
      if (req.query.category) {
        query = { categories: req.query.category }
      }
      const cars = await carsCollection.find(query).toArray();
      res.send(cars);
    });
    app.post('/carsdata', async (req, res) => {
      const data = req.body
      const cars = await carsCollection.insertOne(data);
      res.send(cars);
    });

    // get product using category
    app.get('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { categories: `${id}` };
      const cursor = carsCollection.find(query);
      const cars = await cursor.toArray();
      res.send(cars);
    });

    // Categories
    app.get('/category', async (req, res) => {
      const query = {}
      const categ = await categorie.find(query).toArray();
      res.send(categ);
    })


    //Get booking data
    app.get('/bookings/:email', async (req, res) => {
      const email = req.params.email;
      const query = {email}
      const user = await bookingsCollection.find(query).toArray();
      res.send(user);
    })

    // Post booked data
    app.post('/bookings', async (req, res) => {
      const booking = req.body
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    })

    app.post('/user', async (req, res) => {
      const user = req.body
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    app.get('/user', async (req, res) => {
      const query = {};
      const user = await userCollection.find(query).toArray();
      res.send(user)
    })

    //Orders
    app.get('/myorders/:id', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = await bookingsCollection.find(query).toArray();
      res.send(orders);
    })

    // get user by email
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await userCollection.findOne(query);
      res.send(user);
    })


  }
  finally {

  }
}
run().catch(console.log);



app.get('/', async (req, res) => {
  res.send('as-fall9 server is running')
})

app.listen(port, () => console.log(`as-fall running on ${port}`))

//74 done

