const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d1gdkts.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  })

}



async function run() {
  try {
    const carsCollection = client.db('asfall9').collection('carsdata');
    const bookingsCollection = client.db('asfall9').collection('bookings');
    const userCollection = client.db('asfall9').collection('user');
    const categorie = client.db('asfall9').collection('category');

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.
        category !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
      }
      next();
    }

    app.put('/carsdata/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const upData = {
        $set: {
          status : "available"
        }
      }
      const result = await carsCollection.updateOne(filter, upData, options);
      res.send(result);
    })

    //get cars data using email
    // app.get('/bookings', verifyJWT,  async (req, res) => {
    app.get('/carsdata', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      if (req.query.category) {
        query = { categories: req.query.category }
      }
      const userData = await carsCollection.find(query).toArray();
      res.send(userData);
    })

    // get product using category
    app.get('/status/available', async (req, res) => {
      const id = req.params.available;
      const query = { status: "available" };
      const cursor = carsCollection.find(query);
      const cars = await cursor.toArray();
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

    app.delete('/carsdata/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await carsCollection.deleteOne(filter);
      res.send(result)
    })

    // Categories
    app.get('/category', async (req, res) => {
      const query = {}
      const categ = await categorie.find(query).toArray();
      res.send(categ);
    })


    //Get booking data
    // app.get('/bookings', verifyJWT,  async (req, res) => {
    app.get('/bookings', async (req, res) => {
      let query = {};
      // console.log(req.query);
      // const decodedEmail = req.decoded.email;
      // if(email !== decodedEmail){
      //   return res.status(403).send({message: 'forbidden access'})
      // }
      if (req.query.email) {
        query = { email: req.query.email }

      }
      const userData = await bookingsCollection.find(query).toArray();
      res.send(userData);
    })

    // Post booked data
    app.post('/bookings', async (req, res) => {
      const booking = req.body
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    })

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: '' })
    })

    app.post('/user', async (req, res) => {
      const user = req.body;
      const query = {
        email: user.email
      }
      const oldUser = await userCollection.find(query).toArray();
      if (oldUser.length) {
        const message = "you have already login"
        return res.send({ acknowledge: false, message })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.get('/user', async (req, res) => {
      const query = {};
      const user = await userCollection.find(query).toArray();
      res.send(user)
    })

    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result)
    })

    //get user buyers or seller
    app.get('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { category: `${id}` };
      const cursor = userCollection.find(query);
      const user = await cursor.toArray();
      res.send(user);
    });

    //Orders
    app.get('/myorders/:id', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = await bookingsCollection.find(query).toArray();
      res.send(orders);
    })

    app.put('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const upData = {
        $set: {
          category: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, upData, options);
      res.send(result);
    })

    app.get('/users/seller/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await userCollection.findOne(query);
      res.send(user);
    })

    app.get('/users/buyer/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await userCollection.findOne(query);
      res.send(user);
    })

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await userCollection.findOne(query);
      res.send(user);
    })


    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const upData = {
        $set: {
          status: 'verified'
        }
      }
      const result = await userCollection.updateOne(filter, upData, options);
      res.send(result);
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
