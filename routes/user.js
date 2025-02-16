const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js")

router.get("/signup" , (req , res) =>{
    res.render("users/signup.ejs");
});

// signup
router.post("/signup" ,  wrapAsync (async(req , res) => {
    try{
    let {username , email , password} = req.body;
    const newuser = User({email , username});
   const registerUser = await User.register(newuser , password);
   console.log(registerUser);
   req.login(registerUser , (err) =>{
    if(err){
        return next(err);
    }
    req.flash("success" , "Welcome to Wanderlust!");
    res.redirect("/listings");
   });
    }
    catch(e){
        req.flash("error" , e.message);
        res.redirect("/signup");
    }
}));


// login
router.get("/login" , (req , res) =>{
    res.render("users/login.ejs");
});

router.post("/login",
    saveRedirectUrl, // ✅ Ensure redirect URL is saved
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        const redirectUrl = res.locals.redirectUrl || "/listings"; // ✅ Fix redirect issue
        delete req.session.redirectUrl; // ✅ Clear the session after redirect
        res.redirect(redirectUrl);
    }
);


// logout 
router.get("/logout" , (req , res , next) =>{
    req.logout((err) =>{
        if(err){
          return next(err);
        }
        req.flash("success" , "you are logged out!");
        res.redirect("/listings");
    })
})

module.exports = router;