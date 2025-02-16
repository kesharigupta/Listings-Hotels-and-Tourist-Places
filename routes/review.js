const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // ✅ Import mongoose
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); // ✅ Import Listing model
const { reviewSchema } = require("../schema.js");
const {isLoggedIn , isReviewAuthor} = require("../middleware.js");

// reviewSchema Validation Middleware
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    return res.status(400).send(errMsg); // ✅ Sends validation error response
  } else {
    next();
  }
};

// 📌 POST Route: Add Review to a Listing
router.post("/listings/:id/reviews", 
  isLoggedIn,
  validateReview, wrapAsync(async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      console.log("❌ Listing Not Found");
      return res.redirect("/listings");
    }

    let newReview = new Review({
      comment: req.body.review.comment,  // ✅ Ensure correct field name
      rating: req.body.review.rating
    });
    newReview.author = req.user._id;

    await newReview.save();
    listing.reviews.push(newReview._id);
    await listing.save();
    req.flash("success" , "New Review Created!");

    console.log("✅ New Review Saved:", newReview);

    // Redirect to the listing's page after submission
    res.redirect(`/listings/${listing._id}`);
  } catch (error) {
    console.log("❌ Error Saving Review:", error);
    res.redirect(`/listings/${req.params.id}`);
  }
}));

// 📌 DELETE Route: Remove Review from a Listing
router.delete("/listings/:id/reviews/:reviewId", 
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  
  // Remove the review reference from the Listing document
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  
  // Delete the review itself
  await Review.findByIdAndDelete(reviewId);
  req.flash("success" , "Review Deleted!");

  console.log(`✅ Review ${reviewId} deleted from listing ${id}`);

  res.redirect(`/listings/${id}`);
}));

module.exports = router;
