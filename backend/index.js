import express from "express"
import cors from "cors" 

const app = express();
app.use(cors());
app.use(express.json());

//added route for table fo hospitals
app.get("/api/hospitals", (req, res) => {
    res.json({ message: "List of hospitals goes here" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));