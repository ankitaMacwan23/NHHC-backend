require('dotenv').config();

//core module
const path = require('path');

//External Modules
const express = require('express');
<<<<<<< HEAD
const cors = require('cors');
const bodyParser = require('body-parser');
//const multer = require('multer');
=======
const bodyParser = require('body-parser');
const multer = require('multer');
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

// ✅ Get env vars before using them
<<<<<<< HEAD
const PORT = process.env.PORT || 3000;
=======
const PORT = process.env.PORT || 3001;
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
const MONGO_DB_URL = process.env.MONGO_DB_URL;

//Local Modules
const storeRouter = require('./Routers/storeRouter');
<<<<<<< HEAD
const { patientRouter } = require('./Routers/patientRouter');
const adminRouter = require('./Routers/adminRouter');
const careGiverRouter = require('./Routers/careGiverRouter');
const errorController = require('./controllers/errorController');
const rootDir = require('./util/path-util');
const authRouter = require('./Routers/authRouter');

//const MONGO_DB_URL = "mongodb+srv://root:root@airbnb.n6vwm.mongodb.net/?retryWrites=true&w=majority&appName=airbnb";

const app = express();

app.use(cors({
  origin: 'true', // handles localhost and production
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

=======
const {patientRouter} = require('./Routers/patientRouter');
const adminRouter = require('./Routers/adminRouter');
const careGiverRouter = require('./Routers/careGiverRouter');

const errorController =  require('./controllers/errorController');

const rootDir =  require('./util/path-util');
const authRouter = require('./Routers/authRouter');

const storage = multer.diskStorage({
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
};

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254

app.set('view engine', 'ejs');
app.set('views', 'views');

<<<<<<< HEAD
// static files from legacy 'public' folder
//app.use(express.static(path.join(rootDir, "public")));
=======
app.use(express.static(path.join(rootDir, "public")));

app.use(bodyParser.urlencoded());
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254

const store = new MongoDbStore({
  uri: MONGO_DB_URL,
  collection: 'sessions'
});

<<<<<<< HEAD
=======
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: store,
}));

>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

<<<<<<< HEAD
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// to upload patient medication doc, caregivers's adhar and document
/* app.use(
=======
app.use((req,res,next) => {
  res.locals.session = req.session;
  next();
})

//to upload patient medication doc, caregivers's adhar and document
app.use(
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
  multer({ storage, fileFilter }).fields([
    { name: 'medicationPhotoUrl', maxCount: 1 },
    { name: 'caregiver_aadhar', maxCount: 1 },
    { name: 'caregiver_document', maxCount: 1 }
  ])
<<<<<<< HEAD
); */
=======
);
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/auth", authRouter);
<<<<<<< HEAD
app.use(storeRouter);
app.use("/patient", patientRouter);
app.use("/admin", adminRouter);
app.use("/caregiver", careGiverRouter);

// ✅ Serve React frontend (dist folder)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  console.log('Serving React frontend');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(errorController.get404);

=======

app.use(storeRouter);

app.use("/patient", patientRouter);

app.use("/admin", adminRouter);

app.use("/caregiver", careGiverRouter);

app.use(errorController.get404);



>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
mongoose.connect(MONGO_DB_URL).then(() => {
  console.log('Connected to Mongoose');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
<<<<<<< HEAD
  });
}).catch(err => {
  console.log('Error occur while connecting to mongoose', err);
});
=======
  })

}).catch(err => {
  console.log('Error occur while connecting to mongoose', err);
})
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
