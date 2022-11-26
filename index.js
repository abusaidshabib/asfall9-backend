const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://service_Provider:<password>@cluster0.d1gdkts.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});



app.get('/', async(req, res) => {
    res.send('as-fall9 server is running')
})

app.listen(port, () => console.log(`as-fall running on ${port}`))

//74 done

