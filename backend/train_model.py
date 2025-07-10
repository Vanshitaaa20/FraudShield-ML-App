import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import os

# Check if file exists
if not os.path.exists('data/creditcard.csv'):
    print(" Dataset not found. Please make sure it's in 'data/creditcard.csv'")
    exit()

# Load dataset
data = pd.read_csv('data/creditcard.csv')
print(" Full Data shape:", data.shape)

# Sample 10,000 rows to avoid memory issues
data_sample = data.sample(10000, random_state=42)
print("Sampled Data shape:", data_sample.shape)

# Drop 'Time' column if exists
if 'Time' in data_sample.columns:
    data_sample.drop(['Time'], axis=1, inplace=True)

# Features and target
X = data_sample.drop('Class', axis=1)
y = data_sample['Class']

# Scale 'Amount' column
scaler = StandardScaler()
X['Amount'] = scaler.fit_transform(X[['Amount']])

# Split train and test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print("Train-Test split done.")

# Apply SMOTE
sm = SMOTE(random_state=42)
X_train_res, y_train_res = sm.fit_resample(X_train, y_train)

print(" SMOTE applied.")
print("Before SMOTE:", y_train.value_counts().to_dict())
print("After SMOTE:", y_train_res.value_counts().to_dict())

# Train Random Forest
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train_res, y_train_res)
print("Model trained.")

# Evaluate
y_pred = rf_model.predict(X_test)
y_prob = rf_model.predict_proba(X_test)[:, 1]

print("\n Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\n Classification Report:\n", classification_report(y_test, y_pred))
print(" ROC-AUC Score:", roc_auc_score(y_test, y_prob))

# Save the model
os.makedirs("app/model", exist_ok=True)
joblib.dump(rf_model, 'app/model/fraud_model.pkl')
print(" Model saved to 'app/model/fraud_model.pkl'")
