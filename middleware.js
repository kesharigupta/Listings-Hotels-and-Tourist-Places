const Listing = require("./models/listing");
const Review = require("./models/review.js"); // ✅ Import Review model


module.exports.isLoggedIn = (req , res , next) =>{
    // console.log("User:", req.user);
    if (!req.isAuthenticated || !req.isAuthenticated()) {  // ✅ Ensure the function is executed properly
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login"); // ✅ Redirect user to login page
    }
    next();
};

// ✅ Fix `saveRedirectUrl` Middleware
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; // ✅ Use `res.locals`, not `req.locals`
    } else {
        res.locals.redirectUrl = "/listings"; // ✅ Default redirect if no saved URL
    }
    next();
};


module.exports.isOwner = async (req, res, next) => { // ✅ Mark function as async
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);

        if (!listing) { // ✅ Handle case if listing is not found
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (!listing.owner.equals(res.locals.currentUser._id)) {
            req.flash("error", "You  are not the owner of this listing");
            return res.redirect(`/listings/${id}`); // ✅ Fix redirect URL format
        }

        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings"); // ✅ Redirect on error
    }
};

module.exports.isReviewAuthor = async (req, res, next) => { // ✅ Mark function as async
    try {
        let { id, reviewId } = req.params;  // ✅ Use correct parameter name
let review = await Review.findById(reviewId);


        if (!review) { // ✅ Handle case if listing is not found
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (!review.author.equals(res.locals.currentUser._id)) {
            req.flash("error", "You  are not the author of this review");
            return res.redirect(`/listings/${id}`); // ✅ Fix redirect URL format
        }

        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings"); // ✅ Redirect on error
    }
};