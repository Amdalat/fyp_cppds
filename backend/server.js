const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
// const port = 5000;

app.use(express.json());
app.use(cors());
// app.use(cors({
//   origin: process.env.FRONTEND_URL
// }));

const { verifyDrug, dbCheck } = require('./controller/drugController');

app.post("/drug", verifyDrug);
app.post("/drug/db", dbCheck);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000 }`);
}) 


// const { getdrugs, getdrugbybn, getdrugbysn, verifyDrug, dbCheck } = require('./controller/drugController');

// app.get("/drugs", getdrugs);
// app.get("/drugsn/:serial_number", getdrugbysn);
// app.get("/drugbn/:batch_number", getdrugbybn);