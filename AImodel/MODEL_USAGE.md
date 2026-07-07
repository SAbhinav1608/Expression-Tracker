# Model Usage Guide

## Quick Start: Using the Best Model

### Load the Best Ensemble Model (51.04% Accuracy)

```python
import joblib
import numpy as np

# Load the saved model package
model_package = joblib.load('backend/best_boosting_model.pkl')
model = model_package['model']
pca = model_package['pca']
scaler = model_package['scaler']
label_encoder = model_package['label_encoder']

# Preprocess your data
X_scaled = scaler.transform(X_raw)  # Normalize
X_pca = pca.transform(X_scaled)     # Reduce dimensions

# Make predictions
predictions = model.predict(X_pca)
probabilities = model.predict_proba(X_pca)

# Decode predictions
predicted_emotions = [label_encoder[i] for i in predictions]
```

### File Locations

```
backend/
  ├── best_boosting_model.pkl          ← Best model (USE THIS)
  ├── xgboost_smote_model.pkl          ← Alternative: 50.81% accuracy
  ├── emotion_model_improved.pth       ← Deep learning: 50.80%
  ├── emotion_model.pth                ← Baseline transformer: 50.58%
  │
  ├── label_encoder.npy                ← Emotion class mappings
  ├── mean.npy, std.npy                ← Normalization parameters
  └── [other model files...]
```

## Training Scripts

### Run Best Ensemble Training
```bash
cd D:\B27-main\B27-main\AImodel
python best_ensemble_final.py
```
**Result:** Trains XGBoost + LightGBM and saves to `backend/best_boosting_model.pkl`
**Expected Accuracy:** 51.04%
**Time:** ~5-10 minutes (CPU)

### Run Baseline Deep Learning
```bash
python train.py
```
**Result:** Saves to `backend/emotion_model.pth`
**Expected Accuracy:** 50.58%

### Run Improved Deep Learning
```bash
python train_improved.py
```
**Result:** Saves to `backend/emotion_model_improved.pth`
**Expected Accuracy:** 50.80%

### Run Classical ML Experiments
```bash
python classical_ml_experiments.py
```
**Result:** Saves to `backend/classical_model.pkl`
**Expected Accuracy:** 52.19% (LogisticRegression alone)

## API Integration

### Backend (Node.js) Integration

```javascript
// server.js
const Model = require('./models/Model'); // Your model wrapper

app.post('/predict-emotion', async (req, res) => {
  const features = req.body.landmarks; // 1404 facial landmark coordinates
  
  // Load model
  const model = await loadPythonModel('backend/best_boosting_model.pkl');
  
  // Predict
  const prediction = model.predict([features]);
  const emotion = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad'][prediction[0]];
  
  res.json({ emotion: emotion });
});
```

### Input Format

```
Input: Array of 1404 float values (468 facial landmarks × 3 coordinates each)
  [x₁, y₁, z₁, x₂, y₂, z₂, ..., x₄₆₈, y₄₆₈, z₄₆₈]

Output: Emotion class (0-5)
  0: Angry
  1: Disgust
  2: Fear
  3: Happy
  4: Neutral
  5: Sad
```

## Model Performance Metrics

### Accuracy by Emotion
```
Best Class:    Disgust (78% precision), Happy (81% precision)
Worst Class:   Angry (32%), Sad (31%)
Overall:       51.04% accuracy
```

### Why Performance is Limited
- Small dataset (2,165 samples total)
- High overlap between similar emotions in feature space
- Features may be noisy or insufficient
- Baseline represents realistic ceiling for this dataset

## Performance Comparison

| Model | Accuracy | Type | File |
|-------|----------|------|------|
| XGB + LGB Ensemble | **51.04%** | Gradient Boosting | best_boosting_model.pkl |
| Logistic Regression | 52.19% | Classical ML | classical_model.pkl |
| XGBoost + SMOTE | 50.81% | Gradient Boosting | xgboost_smote_model.pkl |
| Transformer (Improved) | 50.80% | Deep Learning | emotion_model_improved.pth |
| Transformer (Baseline) | 50.58% | Deep Learning | emotion_model.pth |

## Troubleshooting

### "Model not found" error
- Ensure you're running from `D:\B27-main\B27-main\AImodel` directory
- Check that `backend/best_boosting_model.pkl` exists

### Import errors
- Activate venv: `d:\B27-main\.venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`

### Low accuracy on new data
- Current model accuracy ~51% - this is the expected baseline
- Check if input features are properly normalized (z-score)
- Verify landmarks are in same format as training data

## Next Steps (If Continuing)

1. **Accept 51% as baseline** and deploy with caution
2. **Collect more data** - gather 5-10x more labeled samples
3. **Use transfer learning** - train on raw face images with ResNet/Vision Transformer
4. **Clean data** - verify emotion labels are correct
5. **Feature engineering** - extract higher-level features (distances, angles)

---
**Last Updated:** June 3, 2026
**Status:** Saved and ready to resume
