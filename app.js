require('dotenv').config();

// Core Modules
const path = require('path');

// External Modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

// Local Modules
const rootDir = require('./util/path-util');
const storeRouter = require('./Routers/storeRouter');
const { patientRouter } = require('./Routers/patientRouter');
const adminRouter = require('./Routers/adminRouter');
const careGiverRouter = require('./Routers/careGiverRouter');
const authRouter = require('./Routers/authRouter');
const errorController = require('./controllers/errorController');

// Environment Config
const PORT = process.env.PORT || 3000;
const MONGO_DB_URL = process.env.MONGO_DB_URL;

// Express App Init
const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true only in production with HTTPS
      httpOnly: true,
      sameSite: 'lax',
    },
    store: new MongoDbStore({
      uri: MONGO_DB_URL,
      collection: 'sessions',
    }),
  })
);

app.use(flash());

// Global variables for flash messages and session
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.session = req.session;
  next();
});

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// Static Folders
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/auth', authRouter);
app.use(storeRouter);
app.use('/patient', patientRouter);
app.use('/admin', adminRouter);
app.use('/caregiver', careGiverRouter);

// Serve Frontend (Vite/React)
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  console.log('Serving React frontend');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 404 Handler
app.use(errorController.get404);

// DB Connection & Start Server
mongoose.connect(MONGO_DB_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
