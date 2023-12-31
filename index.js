const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



// middleware..........
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oswrsby.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const candidateCollection = client.db('allCandidate').collection('candidates');
        const reviewCollection = client.db("allCandidate").collection('reviews');
        const collegeCollection = client.db("allCandidate").collection('colleges');

        // college api for getting all college information

        app.get('/colleges', async (req, res) => {
            const result = await collegeCollection.find().toArray();
            res.send(result);

        })

        app.get("/myCollege/:email", async (req, res) => {
            const colleges = await candidateCollection
                .find({
                    email: req.params.email,
                })
                .toArray();
            res.send(colleges);
        });



        app.post('/candidates', async (req, res) => {
            const candidate = req.body;
            const result = await candidateCollection.insertOne(candidate);
            res.send(result);
        });


        //    for update

        app.put('/candidates/:id', async (req, res) => {
            const id = req.params.id;
            // Add validation for the id
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid candidate ID' });
            }

            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedUser = req.body;
            const singleUser = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    address: updatedUser.address
                }
            };
            try {
                const result = await candidateCollection.updateOne(filter, singleUser, options);
                res.json(result);
            } catch (error) {
                console.error('Error updating candidate:', error);
                res.status(500).json({ error: 'Error updating candidate' });
            }
        });





        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);

        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('college server is running')
})

app.listen(port, () => {
    console.log(`college server is running on port ${port}`)
})