# Quick Start Guide

## 🚀 Running the Expression Tracker Project (3 Steps)

### Prerequisites
- Node.js v16+ installed
- Python 3.9+ installed
- MongoDB running (local or Atlas)
- All dependencies installed

---

## Step 1: Start Backend (Node.js)

```bash
cd d:\B27-main\B27-main\backend
npm start
```

**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 3000
```

---

## Step 2: Start AI Model (Python/Flask)

Open a new terminal:

```bash
cd d:\B27-main\B27-main\AImodel

# Activate virtual environment (if not already)
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

# Start Flask
python app.py
```

**Expected Output:**
```
✅ Model loaded successfully from: backend/emotion_model.pth
Label encoder loaded: ['Angry' 'Disgust' 'Fear' 'Happy' 'Neutral' 'Sad']
 * Running on http://0.0.0.0:5000
```

---

## Step 3: Start Frontend (React/Vite)

Open a new terminal:

```bash
cd d:\B27-main\B27-main\frontend
npm run dev
```

**Expected Output:**
```
VITE v6.2.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🎮 Using the Application

### Open in Browser
```
http://localhost:5173
```

### Default Credentials
**SuperAdmin:**
- Email: `superadmin@expressiontracker.com`
- Password: `superadmin123`

### Initial Setup
1. Login as SuperAdmin
2. Register a new Admin account
3. Logout and login as Admin
4. Register a Child account
5. Logout and login as Child
6. Start the emotion learning game

---

## 📝 Quick Reference

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend | 5173 | http://localhost:5173 | Open in browser |
| Backend | 3000 | http://localhost:3000 | API endpoint |
| AI Model | 5000 | http://localhost:5000 | Emotion detection |
| MongoDB | 27017 | mongodb://localhost:27017 | Database |

---

## 🛑 Stopping Services

**Backend**: Press `Ctrl+C` in the backend terminal  
**AI Model**: Press `Ctrl+C` in the AI model terminal  
**Frontend**: Press `Ctrl+C` in the frontend terminal  
**MongoDB**: `mongod` will stop when terminal closes

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB
mongod

# Check Node modules
npm install

# Check port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Linux/Mac
```

### AI Model won't start
```bash
# Activate virtual environment first
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Check port 5000
netstat -ano | findstr :5000  # Windows
```

### Frontend won't load
```bash
# Check Node modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check port 5173
netstat -ano | findstr :5173  # Windows
```

---

## 📚 Documentation

For detailed information, see:
- `FINAL_AUDIT_REPORT.md` - Complete audit results
- `SETUP_AND_TESTING_GUIDE.md` - Detailed setup guide
- `INTEGRATION_TESTING_GUIDE.md` - Testing procedures
- `BUG_FIXES_SUMMARY.md` - Bug fixes applied
- `PROJECT_VERIFICATION_CHECKLIST.md` - Verification results

---

## ✨ What You Can Do

### As a Child
1. Login with child credentials
2. Play the emotion-based learning game
3. Let the camera detect your emotions
4. Complete word puzzles

### As an Admin
1. Register and manage children
2. View emotion history
3. Check game reports
4. Generate performance reports

### As SuperAdmin
1. Register admin accounts
2. Manage the system
3. View all data

---

## 🎯 Common Tasks

### To test emotion detection
1. Login as Child
2. Go to Game page
3. Allow camera access
4. Show different facial expressions

### To view emotion history
1. Login as Admin
2. Click on a child
3. View "Emotion Trends"

### To generate a report
1. Complete a game session as Child
2. Login as Admin
3. Click "Generate Report"

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Start MongoDB: `mongod` |
| Port already in use | Change port in .env or kill process |
| CORS error | Ensure all 3 services running |
| Camera permission denied | Grant permission in browser |
| Model not loading | Verify files in backend/ directory |
| Token expired | Login again |

---

## 📞 Need Help?

1. Check the error message in console
2. Review the troubleshooting section above
3. Read SETUP_AND_TESTING_GUIDE.md
4. Check MongoDB for data issues
5. Ensure all services are running

---

**Status: ✅ Ready to Run**  
**Last Updated: 2026-07-07**
