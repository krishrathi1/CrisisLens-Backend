import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 5000;
const MONGODB_URI = process.env.MONGO_URI;
mongoose.connect(MONGODB_URI,{ dbName: "disaster_data" })
    .then(() => { console.log('Connected to MongoDB!!!') })
    .catch(err => { console.error('Could not connect to MongoDB', err) });
    // mongoose.connection.on("connected", async () => {
    //     console.log("Using database:", mongoose.connection.db.databaseName);
    //   });
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true
    }))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server has started successfully !!!');
});

const disasterSchema = new mongoose.Schema({
  _id: String, // Using String since your _id appears to be UUID-like
  title: { type: String, required: true },
  description: { type: String, required: true },
  disasterType: { type: String, required: true },
  imageURLs: { type: [String], default: [] }, // Array of image URLs
  postAuthorURL: { type: String },
  postLink: { type: String },
  clusterIdentifier: { type: String },
  timestamp: { type: Date, required: true },
  location: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  weather: { type: String },
  sentiment: { type: String }
}, { collection: "indian_updated_disaster" }); // Ensure collection name matches

  const Disaster = mongoose.model("Disaster", disasterSchema, "indian_updated_disaster");

  // API Route to Fetch Data
  app.get("/api/disasters", async (req, res) => {
    try {
        const count = await Disaster.countDocuments();
        console.log(`Total documents found: ${count}`);

        if (count === 0) {
            return res.status(404).json({ message: "No disaster records found" });
        }

        const disasters = await Disaster.find();
        res.json(disasters);
        // console.log(disasters);
        
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: error.message });
    }
});


app.get('/api/disasters/:id', async (req, res) => {
    try {
        const disaster = await Disaster.findById(req.params.id);
        if (!disaster) {
            return res.status(404).json({ message: "Disaster not found" });
        }
        res.json(disaster);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, (error) => {
    if(error){
        console.log("Error connecting with server", error);
    }
    else{
        console.log(`Server is listening on port -> ${PORT}`);
        console.log(`\n\nhttp://localhost:${PORT}\n\n`);
    }
});