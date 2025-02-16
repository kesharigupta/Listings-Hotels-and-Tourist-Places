if( process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const {reviewSchema } = require("./schema.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing");




// Router
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));

// machine database
// const MONGO_URL = "mongodb://127.0.0.1:27017/wandeerlust";

// cloud database
const dbUrl = process.env.ATLASTDB_URL;

main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: "mysupersecretcode"
  },
  touchAfter: 24* 3600,
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE:", err);
});


// session
const sessionOptions = {
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie:{
     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
     maxAge: 7 * 24 * 60 * 60 * 1000,
     httpOnly: true,
  }
};


// Root Route
// app.get("/", (req, res) => {
//   res.send("HI, I am root");
// });

app.get("/", async (req, res) => {
  try {
      const allListings = await Listing.find(); // Fetch listings from MongoDB
      res.render("index", { allListings });
  } catch (err) {
      console.error("Error fetching listings:", err);
      res.render("index", { allListings: [] }); // Render page even if there's an error
  }
});




app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req , res , next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  
  next();
});


// listings data
app.use("/" , listings);
// review data
app.use("/" , reviews)
// user data
app.use("/" , user);


app.use((err, req , res ,next) => {
    res.send("Something want wrong!")
})

// Server
app.listen(8080, () => {
  console.log("🚀 Server is running on port 8080");
});
