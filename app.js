require('dotenv').config();
//core module
const path = require('path');

//External Modules
const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
//const multer = require('multer');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

// ✅ Get env vars before using them
const PORT = process.env.PORT || 3000;
const MONGO_DB_URL = process.env.MONGO_DB_URL;

//Local Modules
const storeRouter = require('./Routers/storeRouter');
const {patientRouter} = require('./Routers/patientRouter');
const adminRouter = require('./Routers/adminRouter');
const careGiverRouter = require('./Routers/careGiverRouter');

const errorController =  require('./controllers/errorController');

const rootDir =  require('./util/path-util');
const authRouter = require('./Routers/authRouter');

//const MONGO_DB_URL ="mongodb+srv://root:root@airbnb.n6vwm.mongodb.net/?retryWrites=true&w=majority&appName=airbnb";

/* const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getDate() + '-' + file.originalname);
  },
})

const fileFilter = (req, file, cb) => {
  if([ 'image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.mimetype)){
    cb(null, true);
  }else{
    cb(null,false);
  }
}; */

const app = express();
app.use(cors({
  origin: 'true',
  credentials: true
}));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // use true only if using HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(express.urlencoded({ extended: true })); 

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(rootDir, "public")));

//app.use(bodyParser.urlencoded());

const store = new MongoDbStore({
  uri: MONGO_DB_URL,
  collection: 'sessions'
});


app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use((req,res,next) => {
  res.locals.session = req.session;
  next();
})

//to upload patient medication doc, caregivers's adhar and document
/* app.use(
  multer({ storage, fileFilter }).fields([
    { name: 'medicationPhotoUrl', maxCount: 1 },
    { name: 'caregiver_aadhar', maxCount: 1 },
    { name: 'caregiver_document', maxCount: 1 }
  ])
);
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/auth", authRouter);

app.use(storeRouter);

app.use("/patient", patientRouter);

app.use("/admin", adminRouter);

app.use("/caregiver", careGiverRouter);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  console.log('Serving React frontend');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(errorController.get404);

//const PORT = 3000;

mongoose.connect(MONGO_DB_URL).then(() => {
  console.log('Connected to Mongoose');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  })

}).catch(err => {
  console.log('Error occur while connecting to mongoose', err);
})
