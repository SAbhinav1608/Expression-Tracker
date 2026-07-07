# Integration Testing Guide

## Overview
This guide provides step-by-step tests to verify all components work together correctly.

## Pre-Testing Checklist

- [ ] MongoDB is running and accessible
- [ ] All dependencies installed (npm, pip)
- [ ] .env file configured in backend
- [ ] Python virtual environment activated for AI model
- [ ] All three services can be started without errors

## Test Case 1: Backend Service Startup

### Steps
1. Navigate to backend directory
2. Run `npm start`
3. Wait for connection messages

### Expected Results
```
✅ MongoDB connected
🚀 Server running on port 3000
Socket.IO server initialized
Health check available at http://localhost:3000
```

### Failure Recovery
- If MongoDB error: Check MongoDB running status
- If Port 3000 in use: Change PORT in .env
- If module not found: Run `npm install`

---

## Test Case 2: AI Model Service Startup

### Steps
1. Navigate to AImodel directory
2. Activate Python virtual environment
3. Run `python app.py`
4. Wait for model loading messages

### Expected Results
```
✅ Model loaded successfully from: backend/emotion_model.pth
Label encoder loaded: ['Angry' 'Disgust' 'Fear' 'Happy' 'Neutral' 'Sad']
 * Running on http://0.0.0.0:5000
 * WARNING: This is a development server...
```

### Failure Recovery
- If model not found: Ensure model files in backend/ directory
- If import error: Install requirements: `pip install -r requirements.txt`
- If CUDA error: Model will fall back to CPU automatically

---

## Test Case 3: Frontend Service Startup

### Steps
1. Navigate to frontend directory
2. Run `npm run dev`
3. Wait for Vite initialization

### Expected Results
```
VITE v6.2.0  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Verify in Browser
- Open http://localhost:5173
- Should see child login page
- No console errors in browser DevTools

---

## Test Case 4: Admin Registration & Login

### Prerequisites
- All three services running
- Backend healthy

### Steps
1. Open http://localhost:5173
2. Click on SuperAdmin login button
3. Use default credentials:
   - Email: `superadmin@expressiontracker.com`
   - Password: `superadmin123`
4. Register a new admin:
   - Name: "Test Admin"
   - Phone: "1234567890"
   - Email: "admin@test.com"
   - Password: "admin123"
5. Logout
6. Go to admin-login page
7. Login with new admin credentials

### Expected Results
- ✓ SuperAdmin login successful
- ✓ New admin registration successful
- ✓ Admin can login with new credentials
- ✓ JWT token stored in localStorage as `admin_token`
- ✓ Admin ID stored as `admin_id`
- ✓ Redirected to admin dashboard

### Database Verification
```javascript
// Check MongoDB
db.admins.find({ email: "admin@test.com" })
// Should return admin document with hashed password
```

---

## Test Case 5: Child Registration & Login

### Prerequisites
- Admin logged in
- All services running

### Steps
1. On admin dashboard, register a new child:
   - Name: "Test Child"
   - Phone: "9876543210"
   - User ID: "testchild123"
   - Password: "child123"
2. Logout from admin
3. Go to home page (child login)
4. Enter child credentials:
   - Name: "Test Child"
   - User ID: "testchild123"
   - Password: "child123"
5. Click Login

### Expected Results
- ✓ Child registration successful
- ✓ Socket.io emits 'newChild' event
- ✓ Child login successful
- ✓ JWT token stored as `child_token`
- ✓ User ID stored as `userId`
- ✓ Redirected to game page

### Database Verification
```javascript
// Check MongoDB
db.children.find({ userId: "testchild123" })
// Should show child document with parentId reference
```

---

## Test Case 6: Emotion Detection

### Prerequisites
- Child logged in
- Frontend, backend, and AI model running
- Camera access granted

### Steps
1. On game page, allow camera access
2. Show different expressions to camera
3. Observe emotion detection updates
4. Complete one emotion-based question
5. Check if emotion is saved

### Expected Results
- ✓ Camera feed displays
- ✓ Emotion updates in real-time
- ✓ Face landmarks detected (visible in console)
- ✓ Emotion displayed correctly
- ✓ Game progresses to next question
- ✓ Console shows "Emotion saved" message

### Backend Verification
Check server logs:
```
POST /child/save-emotion 200 OK
Emotion saved: Happy
Socket.IO: emotionUpdate event emitted
```

### Network Tab (DevTools)
- `/detect-emotion` should return 200 with emotion data
- `/save-emotion` should return 200

---

## Test Case 7: Game Completion Flow

### Prerequisites
- Child on game page
- Emotion detection working

### Steps
1. Complete 5+ questions with correct answers
2. Show different emotions during play
3. Observe score calculation
4. Wait for game completion
5. Check admin dashboard for new report

### Expected Results
- ✓ Score increases with correct answers
- ✓ Emotion history tracked
- ✓ Game completion page shows confetti
- ✓ Auto-logout after 4 seconds
- ✓ Report saved to database

### Database Verification
```javascript
db.children.find({ userId: "testchild123" }).gameReports
// Should show multiple game report entries
```

---

## Test Case 8: Admin Dashboard Features

### Prerequisites
- Admin logged in
- At least one child with game data

### Steps
1. View children list
2. Click on a child to view details
3. Check emotion history
4. Check game reports
5. Edit child information
6. Generate report (if GEMINI_API_KEY set)

### Expected Results
- ✓ Children list displays correctly
- ✓ Child details show emotion history
- ✓ Game reports show scores and emotions
- ✓ Edit child updates data
- ✓ Report generation works (if API key set)
- ✓ Socket.io updates in real-time

---

## Test Case 9: Real-Time Updates

### Prerequisites
- Two browsers/tabs open
- Admin in one, child game in another
- Same backend connected

### Steps
1. Open admin dashboard in Tab A
2. Open child game in Tab B
3. Child completes a question in Tab B
4. Observe Tab A updates automatically

### Expected Results
- ✓ Tab A receives Socket.io update without refresh
- ✓ Emotion data appears in real-time
- ✓ Game report appears in real-time
- ✓ Child list updates immediately

### Console Verification
Check for Socket.io messages:
```
Socket.IO client connected: [ID]
emotionUpdate event received
gameReportUpdate event received
```

---

## Test Case 10: Error Handling

### Test 10a: Invalid JWT Token

**Steps:**
1. Modify `child_token` in localStorage to invalid value
2. Refresh page or make API call

**Expected:**
- ✓ Error message: "Unauthorized" or "Invalid token"
- ✓ Redirect to login page
- ✓ Token cleared from localStorage

### Test 10b: Missing Camera Permission

**Steps:**
1. Deny camera access when prompted
2. Try to start game

**Expected:**
- ✓ Error message displayed
- ✓ Graceful fallback (game doesn't crash)

### Test 10c: Network Disconnection

**Steps:**
1. Disable network/go offline
2. Try to submit game answer
3. Restore network

**Expected:**
- ✓ Error message about network
- ✓ Retry option available
- ✓ Connection recovers when network restored

### Test 10d: Model Service Down

**Steps:**
1. Stop Flask server
2. Try emotion detection on game page

**Expected:**
- ✓ Emotion detection fails gracefully
- ✓ Error shown in console
- ✓ Game doesn't crash

---

## Test Case 11: Database Integrity

### Prerequisites
- Run all test cases above
- Data accumulated in MongoDB

### Steps
1. Export MongoDB collections:
```bash
mongoexport --db expressiontracker --collection admins --out admins.json
mongoexport --db expressiontracker --collection children --out children.json
mongoexport --db expressiontracker --collection reports --out reports.json
```

2. Verify data structure:
```javascript
// Check admin
db.admins.findOne()
// Should have: name, phone, email, password, active, registeredAt

// Check child
db.children.findOne()
// Should have: childName, userId, parentId, emotionHistory, gameReports

// Check report
db.reports.findOne()
// Should have: childId, sessionDuration, quizScore, emotionDistribution, report
```

### Expected Results
- ✓ All collections have correct data types
- ✓ Foreign key references are valid
- ✓ Timestamps are accurate
- ✓ No null/undefined required fields

---

## Test Case 12: Performance Testing

### Load Test: Backend

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/

# Expected:
# - Requests per second: > 100
# - 99% response time: < 500ms
# - No errors
```

### Load Test: Emotion Detection

```bash
# Simulate concurrent emotion requests
# Expected:
# - Handle 10+ concurrent requests
# - Inference time: < 200ms per request
# - No memory leaks
```

---

## Test Case 13: Security Checks

### Test 13a: SQL Injection

**Steps:**
1. Try to login with: `" OR "1"="1`

**Expected:**
- ✓ Login fails
- ✓ No database compromise

### Test 13b: XSS Prevention

**Steps:**
1. Register child with name: `<script>alert('XSS')</script>`
2. Check if script executes

**Expected:**
- ✓ Script doesn't execute
- ✓ Data properly sanitized

### Test 13c: CSRF Protection

**Expected:**
- ✓ State tokens in forms
- ✓ Same-origin policy enforced

---

## Automated Test Script

### Run All Tests

```bash
#!/bin/bash

echo "Starting Integration Tests..."

# Test 1: Backend health
echo "Test 1: Backend Health Check"
curl -s http://localhost:3000/ | grep "ok" && echo "✓ PASS" || echo "✗ FAIL"

# Test 2: Flask health
echo "Test 2: Flask Emotion API Health"
curl -s -X POST http://localhost:5000/detect_emotion \
  -H "Content-Type: application/json" \
  -d '{"landmarks":[]}' | grep "error" && echo "✓ PASS" || echo "✗ FAIL"

# Test 3: Frontend loads
echo "Test 3: Frontend Loads"
curl -s http://localhost:5173/ | grep "expressiontracker" && echo "✓ PASS" || echo "✗ FAIL"

echo "Integration Tests Complete"
```

---

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS Error | Frontend can't reach backend | Check CORS config in server.js |
| 404 Not Found | Wrong API endpoint | Check route definitions |
| Emotion not saving | Backend service down | Restart backend, check logs |
| Camera won't work | Permission denied | Grant permission, check browser console |
| MongoDB error | Connection failed | Start MongoDB, check MONGO_URI |
| Model loading failed | File not found | Check emotion_model.pth location |
| JWT expired | Token too old | Clear localStorage, login again |

---

## Performance Benchmarks

| Component | Metric | Target | Current |
|-----------|--------|--------|---------|
| Backend | API Response | < 100ms | TBD |
| AI Model | Inference | < 200ms | TBD |
| Frontend | Page Load | < 2s | TBD |
| Database | Query | < 50ms | TBD |

---

## Sign-Off

- [ ] All tests passed
- [ ] No errors in console
- [ ] Data persists correctly
- [ ] Real-time updates work
- [ ] Error handling functions properly
- [ ] Performance meets benchmarks

**Tested by:** _______________  
**Date:** _______________  
**Status:** ✓ Ready for Production
