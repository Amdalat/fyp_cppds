from fastapi import FastAPI
import joblib
import pandas as pd
from features import build_features

app = FastAPI()

model = joblib.load("pharma_fake_detector_xgb1.pkl")
le_manuf = joblib.load("manufacturer_encoder1.pkl")
le_batch = joblib.load("batch_prefix_encoder1.pkl")
le_serial = joblib.load("serial_postfix_encoder1.pkl")
feature_columns = joblib.load("feature_columns1.pkl")

THRESHOLD = 0.25

# missing = set(feature_columns) - set(X.columns)
# extra = set(X.columns) - set(feature_columns)

# if missing or extra:
#     raise ValueError(f"Feature mismatch. Missing: {missing}, Extra: {extra}")

@app.post("/predict")
def predict(data: dict):

    try:
        features = build_features(data, le_manuf, le_batch, le_serial)
        shelf_life_days = features["shelf_life_days"]
        nafdac_risk = features["nafdac_risk"]

        nafdac_reg = data["nafdac_reg"]

        # if (
        #     "-" not in nafdac_reg
        #     or len(nafdac_reg) < 7
        #     or len(nafdac_reg) > 8
        #     or "12345678" in nafdac_reg
        # ):
        #     return {
        #         "status": "Counterfeit",
        #         "probability_fake": 80.0,
        #         "reason": "Invalid NAFDAC registration number"
        #     }

        X = pd.DataFrame([features])[feature_columns]

        prob_fake = float(model.predict_proba(X)[0][1])

        if shelf_life_days > 1826:
            prob_fake += 0.15

        if shelf_life_days > 2500:
            prob_fake += 0.3

        # prob_fake += nafdac_risk * 0.8

        prob_fake = min(prob_fake, 1.0)

        # if (nafdac_reg != ""):
        #     print("NAFDAC REG:", nafdac_reg)
        if (
            "-" not in nafdac_reg
            or len(nafdac_reg) < 7
            or len(nafdac_reg) > 8
            or "12345678" in nafdac_reg
        ): 
            if (prob_fake < 0.2):
                prob_fake += 0.8
            else:
                prob_fake += (1-prob_fake) * 0.8

        # if shelf_life_days > 1826:
        #     prob_fake += min(0.4, (shelf_life_days - 1826) / 3000)

        print(type(prob_fake))
        print(prob_fake)

        return {
            "status": "Counterfeit" if prob_fake > THRESHOLD else "Genuine",
            "probability_fake": (float(round(prob_fake * 100, 2)))
        }

    except Exception as e:
        return {"error": str(e), "msg":"1"}