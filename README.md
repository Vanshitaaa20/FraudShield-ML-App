# FraudShield ML App

A full-stack ML-powered fraud detection dashboard:
-  Real-time and bulk credit card transaction fraud predictions
-  Backend: FastAPI
-  Frontend: Next.js + Tailwind + React Data Table

## Features
- Single transaction prediction with probability
- Bulk CSV uploads and predictions
- Downloadable result CSV
- Clean dark UI

## Run Locally
**Backend**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend/my-app
npm run dev 
