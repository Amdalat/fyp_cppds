const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const { verifyDrug, dbCheck } = require('./controller/drugController');

app.post("/drug", verifyDrug);
app.post("/drug/db", dbCheck);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}) 


// const { getdrugs, getdrugbybn, getdrugbysn, verifyDrug, dbCheck } = require('./controller/drugController');

// app.get("/drugs", getdrugs);
// app.get("/drugsn/:serial_number", getdrugbysn);
// app.get("/drugbn/:batch_number", getdrugbybn);