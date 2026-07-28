const Database = require('better-sqlite3');
const path = require("path");

const db = new Database(
    path.join(__dirname, "..", "database", "registered_drugs1.db")
);

const axios = require('axios');
const FASTAPI_URL = 'http://127.0.0.1:8000/predict';   // Your FastAPI URL

const mlapi = async (req, res, manufacturer, batch_number, serial_number, manuf_date, expiry_date, nafdac_reg) => {
  try {
    const mlPayload = {
      manufacturer: manufacturer || "FakePharm",
      batch_number: batch_number,
      serial_number: serial_number,
      manuf_date: manuf_date,
      expiry_date: expiry_date,
      nafdac_reg: nafdac_reg || "N/A"
    };

    const mlResponse = await axios.post(FASTAPI_URL, mlPayload);

    return res.status(200).json({
      status: mlResponse.data.status,
      source: "ml_model",
      db_match: false, 
      probability_fake: mlResponse.data.probability_fake,
      details: mlResponse.data
    });

  } catch (mlError) {
    console.error("ML API Error:");

    if (mlError.response) {
      console.error(mlError.response.data);
    } else {
      console.error(mlError.message);
    }

    return res.status(500).json({
      error: "ML prediction failed",
      details: mlError.response?.data || mlError.message
    });
  }
}

const dbCheck = async (req, res) => {
  const { batch_number, serial_number, manufacturer, manuf_date, expiry_date, nafdac_reg } = req.body || {};

  let fake_count = 0;

  try{
    const sql = db.prepare('SELECT * FROM registered_drugs1 WHERE batch_prefix = ? AND serial_postfix = ? LIMIT 1');
    const drug = sql.get(batch_number, serial_number);

    console.log(drug);

    if (drug) {
      console.log("Drug found in database:", drug);

      if (nafdac_reg !== drug.nafdac_reg) {
        fake_count+= 35.00;
      }
      if (manufacturer !== drug.manufacturer) {
        fake_count+= 16.66;
      }
      if (manuf_date !== drug.manuf_date) {
        fake_count+= 16.66;
      }
      if (expiry_date !== drug.expiry_date) {
        fake_count+= 16.66;
      }

      if(fake_count > 25) {
        return res.status(200).json({
          status: "Counterfeit",
          source: "database",
          db_match: true,
          probability_fake: fake_count,
          details: drug
        });
      }

      return res.status(200).json({
          status: "Genuine",
          source: "database",
          db_match: true,
          probability_fake: fake_count,
          details: drug
      });
    } else {
      await mlapi(req, res, manufacturer, batch_number, serial_number, manuf_date, expiry_date, nafdac_reg);
    }
  }catch(err) {
    // return res.status(200).json({
    //   status: "mlResponse.data.status",
    //   source: "ml_model",
    //   db_match: false, 
    //   probability_fake: mlResponse.data.probability_fake,
    //   details: mlResponse.data
    // });
    console.error("Error occurred while checking drug:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const verifyDrug = async (req, res) => {
  console.log("Received drug verification request:", req.body);

  const { batch_number, serial_number, manufacturer, manuf_date, expiry_date, nafdac_reg } = req.body || {};

  if (!batch_number && !serial_number) {
    return res.status(400).json({ error: "batch_number or serial_number is required" });
  }

  try {
    const sql = db.prepare('SELECT * FROM registered_drugs1 WHERE batch_prefix = ? AND serial_postfix = ? LIMIT 1');
    const drug = sql.get(batch_number, serial_number);

    console.log(drug);

    if (drug) {
      console.log("Drug found in database:", drug);

      return res.status(200).json({
        status: "Genuine",
        source: "database",
        db_match: true,
        probability_fake: 0,
        details: drug
      });
    } else {
      await mlapi(req, res, manufacturer, batch_number, serial_number, manuf_date, expiry_date, nafdac_reg);
    };
  } catch (error) {
      res.status(500).json({ error: error.message, msg:1 });
  }
};

module.exports = { verifyDrug, dbCheck };

// const getdrugs = async (req, res) => {
//   try {
//     const sql = db.prepare('SELECT * FROM registered_drugs').all();
//     res.status(200).json({Number_of_Drugs: sql.length, Drugs: sql});
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// const getdrugbysn= async (req, res) => {
//   try {
//     const sql = db.prepare('SELECT * FROM registered_drugs WHERE serial_number = ?');
//     const drug = sql.get([req.params.serial_number]);

//     if (!drug) {
//       return res.status(404).json({ error: 'Drug not found' });
//     }

//     res.status(200).json(drug);


//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// const getdrugbybn= async (req, res) => {
//   try {
//     const sql = db.prepare('SELECT * FROM registered_drugs WHERE batch_number = ?');
//     const drug = sql.get([req.params.batch_number]);

//     if (!drug) {
//       return res.status(404).json({ error: 'Drug not found' });
//     }
    
//     res.status(200).json(drug);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// module.exports = { getdrugs, getdrugbysn, getdrugbybn, verifyDrug, dbCheck };