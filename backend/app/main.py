from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from fastapi import UploadFile, File
import pandas as pd
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fraud-shield-ml-app-8dmk.vercel.app",
        "https://fraudshield-ml-app-production.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


feature_names = [
    "V1","V2","V3","V4","V5","V6","V7","V8","V9","V10",
    "V11","V12","V13","V14","V15","V16","V17","V18","V19","V20",
    "V21","V22","V23","V24","V25","V26","V27","V28","Amount"
]

class Transaction(BaseModel):
    v1: float
    v2: float
    v3: float
    v4: float
    v5: float
    v6: float
    v7: float
    v8: float
    v9: float
    v10: float
    v11: float
    v12: float
    v13: float
    v14: float
    v15: float
    v16: float
    v17: float
    v18: float
    v19: float
    v20: float
    v21: float
    v22: float
    v23: float
    v24: float
    v25: float
    v26: float
    v27: float
    v28: float
    amount: float

model = joblib.load("app/model/fraud_model.pkl")

@app.get("/")
async def root():
    return {"status": "FraudShield API is running "}

@app.post("/predict")
async def predict(transaction: Transaction):
    input_data = pd.DataFrame(
        [[getattr(transaction, field) for field in transaction.model_fields]],
        columns=feature_names
    )

    prediction = int(model.predict(input_data)[0])
    fraud_probability = round(float(model.predict_proba(input_data)[0][1]), 5)
    return {
        "success": True,
        "data": {
            "prediction": prediction,
            "fraud_probability": fraud_probability
        },
        "message": "Fraud prediction successful!"
    }
@app.post("/bulk_predict")
async def bulk_predict(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith('.csv'):
       return JSONResponse(content={"error": "Please upload a valid CSV file."}, status_code=400)

    df = pd.read_csv(file.file)
    required_columns = ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10',
                        'V11','V12','V13','V14','V15','V16','V17','V18','V19','V20',
                        'V21','V22','V23','V24','V25','V26','V27','V28','Amount']

    if not all(col in df.columns for col in required_columns):
        return JSONResponse(content={"error": "CSV must contain columns: V1-V28 and Amount."}, status_code=400)

    predictions = model.predict(df)
    probabilities = model.predict_proba(df)[:, 1]

    df['Prediction'] = predictions
    df['Fraud_Probability'] = probabilities

    result_json = df.to_dict(orient='records')
    return result_json
@app.post("/bulk_predict_csv")
async def bulk_predict_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    if not file.filename or not file.filename.endswith('.csv'):
        return JSONResponse(content={"error": "Please upload a valid CSV file."}, status_code=400)
    # Predict, add columns...
    predictions = model.predict(df)
    probabilities = model.predict_proba(df)[:, 1]
    df['Prediction'] = predictions
    df['Fraud_Probability'] = probabilities

    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    return StreamingResponse(stream, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=result.csv"})