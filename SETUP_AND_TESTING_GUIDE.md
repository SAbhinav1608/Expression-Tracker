# Expression Tracker - Setup & Testing Guide

## Project Architecture

The Expression Tracker project consists of three main components:

1. **Backend (Node.js/Express)** - Port 3000
   - MongoDB database integration
   - User authentication (Admin, Child, SuperAdmin)
   - Game reporting and analytics
   - Socket.io for real-time updates

2. **AI Model (Python/Flask)** - Port 5000
   - Emotion detection using transformer-based neural network
   - Face landmark detection via MediaPipe
   - REST API for emotion prediction

3. **Frontend (React/Vite)** - Port 5173
   - Interactive emotion-based learning game
   - Real-time emotion detection with camera feed
   - Admin dashboard for parent monitoring

## Prerequisites

### System Requirements
- Node.js v16+ (for backend and frontend)
- Python 3.9+ (for AI model)
- MongoDB (local or Atlas)
- GPU (optional, for faster model inference)

### Required Software
- Git
- npm or yarn
- MongoDB Community or MongoDB Atlas account

## Installation & Setup

### 1. Backend Setup

```bash
cd d:\B27-main\B27-main\backend

# Install dependencies
npm install

# Verify .env file exists with:
# - MONGO_URI: your MongoDB connection string
# - JWT_SECRET: secret key (already set)
# - PORT: 3000
# - GEMINI_API_KEY: optional, for report generation

# Start backend server
npm start
```

**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 3000
Socket.IO server initialized
```

### 2. AI Model Setup

```bash
cd d:\B27-main\B27-main\AImodel

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

**Expected Output:**
```
✅ Model loaded successfully from: backend/emotion_model.pth
Label encoder loaded: ['Angry' 'Disgust' 'Fear' 'Happy' 'Neutral' 'Sad']
 * Running on http://0.0.0.0:5000
```

### 3. Frontend Setup

```bash
cd d:\B27-main\B27-main\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v6.2.0  ready in 234 ms
➜  Local:   http://localhost:5173/
➜  press h to show help
```

## API Integration Verification

### Backend Endpoints (Port 3000)

#### Admin Routes
- `POST /admin/login` - Admin login
- `GET /admin/verify-token` - Verify JWT token
- `POST /admin/register-child` - Register a new child
- `GET /admin/children` - Get all children
- `PUT /admin/children/:childId/edit` - Edit child info
- `DELETE /admin/children/:childId/delete` - Delete child

#### Child Routes
- `POST /child/login` - Child login
- `GET /child/verify-token` - Verify child JWT
- `POST /child/save-emotion` - Save emotion data
- `POST /child/save-game` - Save game report
- `GET /child/game-reports/:userId` - Get game reports

#### SuperAdmin Routes
- `POST /superadmin/login` - SuperAdmin login
- `GET /superadmin/verify-token` - Verify token
- `POST /superadmin/register-admin` - Register new admin

#### Reports
- `POST /api/reports/generate` - Generate Gemini report

### AI Model Endpoints (Port 5000)

- `POST /detect_emotion` - Detect emotion from facial landmarks
  - Input: `{ landmarks: [x1, y1, z1, x2, y2, z2, ...] }` (468 points × 3 coordinates)
  - Output: `{ emotion: "Happy", probabilities: {...} }`

## Frontend Routes

- `/` - Child login
- `/admin-login` - Admin login
- `/superadmin-login` - SuperAdmin login
- `/game` - Emotion learning game (protected)
- `/admin` - Admin dashboard (protected)
- `/superadmin` - SuperAdmin dashboard (protected)

## Testing Checklist

### Unit Tests

#### ✅ Backend Authentication
```bash
# Test admin login
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Expected: Returns token and adminId
```

#### ✅ Emotion Detection
```bash
# Test emotion detection
curl -X POST http://localhost:5000/detect_emotion \
  -H "Content-Type: application/json" \
  -d '{"landmarks":[...]}'  # 468*3 values

# Expected: Returns emotion prediction with probabilities
```

### Integration Tests

#### 1. Complete User Flow
1. Start all three services (backend, AI model, frontend)
2. Open http://localhost:5173
3. Register a new admin via SuperAdmin dashboard
4. Admin registers a child
5. Child logs in and plays emotion game
6. Verify emotion data is saved to MongoDB
7. Admin can view child's emotion history

#### 2. Emotion Detection Flow
1. Open Game component
2. Allow camera access
3. Show different facial expressions
4. Verify emotion detection updates in real-time
5. Check emotion data saved to database

#### 3. Report Generation
1. Admin completes a game session
2. Generate report via admin dashboard
3. Verify Gemini API response (if GEMINI_API_KEY set)
4. Check report saved to database

## MongoDB Collections

### Admin Collection
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String (unique),
  email: String (unique),
  profilePhoto: String,
  password: String (hashed),
  active: Boolean,
  registeredAt: Date
}
```

### Child Collection
```javascript
{
  _id: ObjectId,
  childName: String,
  phone: String (unique),
  userId: String (unique),
  password: String (hashed),
  registeredAt: Date,
  parentId: ObjectId (ref: Admin),
  isActive: Boolean,
  emotionHistory: [{
    emotion: String,
    question: String,
    timestamp: Date
  }],
  gameReports: [{
    score: Number,
    completedAt: Date,
    emotions: [String],
    question: String,
    isCorrect: Boolean
  }]
}
```

### Report Collection
```javascript
{
  _id: ObjectId,
  childId: ObjectId (ref: Child),
  userId: String,
  childName: String,
  sessionDuration: Number,
  quizScore: Number,
  memoryScore: Number,
  emotionDistribution: Map<String, Number>,
  report: String,
  modelName: String,
  createdBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/joyverse
JWT_SECRET=24f5dc08011370f6735100d6ec4811f1127c3833eb746efdb152f4c9ee9168cd
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### AI Model (app.py)
- Configures Flask CORS for localhost:5173 and localhost:5174
- Loads pre-trained emotion model from `backend/emotion_model.pth`
- Loads label encoder and normalization parameters

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Solution:**
- Ensure MongoDB is running: `mongod`
- Update MONGO_URI in .env
- For MongoDB Atlas: Use connection string from Atlas dashboard

### Issue 2: Port Already in Use
**Solution:**
- Backend: Change PORT in .env
- Flask: Change port in app.py
- Frontend: Change port in vite.config.js

### Issue 3: CORS Errors
**Solution:**
- Backend CORS already configured for localhost:5173 and 5174
- Flask CORS is enabled for all origins
- Ensure all services are running

### Issue 4: Model Loading Failed
**Solution:**
- Verify emotion_model.pth exists in backend/
- Check label_encoder.npy, mean.npy, std.npy exist
- Retrain model if files are corrupted

### Issue 5: Camera Permission Denied
**Solution:**
- Grant browser camera permission
- Use HTTPS in production
- Check browser console for detailed error

## Performance Optimization

### Backend
- Implement database indexing for frequently queried fields
- Use connection pooling for MongoDB
- Add caching for admin children list

### AI Model
- Load model once at startup (already implemented)
- Use GPU if available (auto-detected)
- Batch process landmarks for multiple children

### Frontend
- Enable code splitting in Vite build
- Optimize image assets
- Implement lazy loading for components

## Security Checklist

- ✅ JWT tokens expire after 1 hour
- ✅ Passwords hashed with bcryptjs
- ✅ Input validation on all endpoints
- ✅ CORS configured for specific origins
- ✅ Error messages don't leak sensitive info
- ⚠️ TODO: Use HTTPS in production
- ⚠️ TODO: Implement rate limiting
- ⚠️ TODO: Add request logging

## Deployment

### Backend Deployment (Production)
1. Set NODE_ENV=production
2. Use environment variables for sensitive data
3. Deploy to Heroku, AWS, or DigitalOcean
4. Use MongoDB Atlas for database

### AI Model Deployment
1. Containerize with Docker
2. Use GPU instance for inference
3. Implement model versioning
4. Add request logging and monitoring

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or AWS S3
3. Configure CDN for assets
4. Set correct API endpoint in production

## Monitoring & Logging

### Backend Logging
- Socket.io connection events
- API request/response times
- Database operations
- Error stack traces

### AI Model Logging
- Model inference time
- Emotion predictions
- Error handling

### Frontend Logging
- User interactions
- API errors
- Component lifecycle events

## Support & Documentation

For issues or questions:
1. Check the logs in each service
2. Review README files in each directory
3. Check database for data integrity
4. Test each service independently first
