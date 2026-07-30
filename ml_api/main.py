from fastapi import FastAPI
import joblib
import pandas as pd
from features import build_features
# import traceback

app = FastAPI()

model = joblib.load("pharma_fake_detector_xgb2.pkl")
le_manuf = joblib.load("manufacturer_encoder2.pkl")
le_batch = joblib.load("batch_prefix_encoder2.pkl")
le_serial = joblib.load("serial_postfix_encoder2.pkl")
feature_columns = joblib.load("feature_columns2.pkl")

THRESHOLD = 0.25

@app.post("/predict")
def predict(data: dict):

    try:
        features = build_features(data, le_manuf, le_batch, le_serial)

        # print(features["manufacturer_enc"])
        # print(features["batch_prefix_enc"])
        # print(features["serial_postfix_enc"])

        # for k, v in features.items():
        #     print(f"{k}: {v}")

        shelf_life_days = features["shelf_life_days"]
        nafdac_risk = features["nafdac_risk"]

        nafdac_reg = data["nafdac_reg"]

        X = pd.DataFrame([features])[feature_columns]
        # print(X.T)

        prob_fake = float(model.predict_proba(X)[0][1])

        # print("Raw model probability:", prob_fake)
        # print(X)

        if shelf_life_days > 1826:
            prob_fake += 0.15

        if shelf_life_days > 2500:
            prob_fake += 0.3

        prob_fake = min(prob_fake, 1.0)


        if (
            "-" not in nafdac_reg
            or len(nafdac_reg) < 7
            or len(nafdac_reg) > 9
            or "12345678" in nafdac_reg
        ): 
            if (prob_fake < 0.2):
                prob_fake += 0.8
            else:
                prob_fake += (1-prob_fake) * 0.8

        # print(type(prob_fake))
        # print(prob_fake)

        return {
            "status": "Counterfeit" if prob_fake > THRESHOLD else "Genuine",
            "probability_fake": (float(round(prob_fake * 100, 2)))
        }

    except Exception as e:
        # traceback.print_exc()
        return {"error": str(e), "msg":"1"}