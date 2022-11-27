const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d1gdkts.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    const carsCollection = client.db('asfall9').collection('carsdata');

    app.get('/carsdata', async(req, res) => {
      const query = {};
      const options = await carsCollection.find(query).toArray();
      res.send(options);
    })
  }
  finally{

  }
}
run().catch(console.log);



app.get('/', async(req, res) => {
    res.send('as-fall9 server is running')
})

app.listen(port, () => console.log(`as-fall running on ${port}`))

//74 done

