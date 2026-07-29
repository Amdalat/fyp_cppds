import pandas as pd

def safe_transform(le, value):
    if value in le.classes_:
        return le.transform([value])[0]
    return -1 

def build_features(data, le_manuf, le_batch, le_serial):

    manufacturer = data["manufacturer"]
    batch_number = data["batch_number"]
    nafdac_reg = data["nafdac_reg"]
    serial_postfix = data["serial_number"]

    manuf_date = pd.to_datetime(data["manuf_date"]).toordinal()
    expiry_date = pd.to_datetime(data["expiry_date"]).toordinal()

    batch_prefix = batch_number

    manuf_after_expiry = int(manuf_date > expiry_date)
    shelf_life_days = expiry_date - manuf_date
    very_long_shelf_life = int(shelf_life_days > 1826)

    nafdac_risk = (
        (0 if "-" in nafdac_reg else 0.3)
        + max(0, (7 - len(nafdac_reg))) * 0.2
        + max(0, (len(nafdac_reg) - 8)) * 0.15
        + (0.5 if "12345678" in nafdac_reg else 0)
    )

    nafdac_risk = min(1.0, nafdac_risk)

    return {
        "shelf_life_days": shelf_life_days,
        "has_hyphen_nafdac": int("-" in nafdac_reg),
        "nafdac_length": len(nafdac_reg),

        "batch_length": len(batch_number),
        "serial_has_sn": int("SN" in serial_postfix),
        "serial_length": len(serial_postfix),
        
        "manufacturer_enc": safe_transform(le_manuf, manufacturer),
        "batch_prefix_enc": safe_transform(le_batch, batch_prefix),
        "serial_postfix_enc": safe_transform(le_serial, serial_postfix),

        "manuf_date_ord": manuf_date,
        "expiry_date_ord": expiry_date,

        "is_expired": int(expiry_date < manuf_date),

        "suspicious_nafdac": int(
            "-" not in nafdac_reg
            or len(nafdac_reg) < 7
            or len(nafdac_reg) > 8
            or "12345678" in nafdac_reg
        ),

        "nafdac_risk": nafdac_risk,

        "weird_serial": int(len(serial_postfix) < 15),

        "manuf_after_expiry": int(manuf_date > expiry_date),
        "very_long_shelf_life": int(shelf_life_days > 1826),

        "serial_repetitive": int(
            any(x in serial_postfix for x in ["0000","1111","2222","9999"])
        ),

        "batch_invalid": int(
            "INVALID" in batch_number or "XYZ" in batch_number
        ),

        "manuf_anomaly": int(manufacturer == "FakePharm"),

        "serial_has_many_zeros": serial_postfix.count("0"),

        "manuf_typo_flag": int(manufacturer[-1].islower()),

    }