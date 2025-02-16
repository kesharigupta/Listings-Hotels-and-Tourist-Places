const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // ✅ Import mongoose
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing");
const {isLoggedIn , isOwner} = require("../middleware.js");

// Index Route - Display all Listings
router.get("/listings", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (error) {
        console.log("❌ Error Fetching Listings:", error);
        res.redirect("/");
    }
});

// New Route - Form to Create New Listing
router.get("/listings/new",isLoggedIn ,(req, res) => {
    res.render("listings/new.ejs");
});


// Show Route - Display a Single Listing
router.get("/listings/:id", async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) { // ✅ Mongoose is now defined
        console.log("❌ Invalid ObjectId:", id);
        return res.redirect("/listings");
    }

    try {
        const listing = await Listing.findById(id)
        .populate({path: "reviews", populate:{
            path: "author",
        }})
        .populate("owner");
        if (!listing) {
            console.log("❌ Listing Not Found");
            return res.redirect("/listings");
        }
        console.log(listing);
        res.render("listings/show.ejs", { listing });
    } catch (error) {
        console.log("❌ Error Fetching Listing:", error);
        res.redirect("/listings");
    }
});

// Create Route - Add New Listing
router.post("/listings",
    isLoggedIn,
     async (req, res, next) => {
    try {
        const listingData = {
            title: req.body.listing.title,
            description: req.body.listing.description,
            price: req.body.listing.price,
            location: req.body.listing.location,
            country: req.body.listing.country,
            image: {
                url: req.body.listing.imageUrl,
                filename: req.body.listing.imageUrl ? "custom" : "default",
            },
        };

        const newListing = new Listing(listingData);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success" , "New Listing Created!");
        

        console.log("✅ New Listing Created:", newListing);
        res.redirect("/listings");
    } catch (error) {
        console.log("❌ Error Creating Listing:", error);
        res.redirect("/listings/new");
        next(error);
    }
});

// Edit Route - Form to Edit Listing
router.get("/listings/:id/edit",
    isLoggedIn,
    isOwner,
     async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("❌ Invalid ObjectId:", id);
        return res.redirect("/listings");
    }

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            console.log("❌ Listing Not Found");
            return res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    } catch (error) {
        console.log("❌ Error Fetching Listing for Edit:", error);
        res.redirect("/listings");
    }
});

// Update Route - Modify an Existing Listing
router.put("/listings/:id", 
    isLoggedIn,
    isOwner,
    async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID!");
        return res.redirect("/listings");
    }

    try {
        const updatedListing = await Listing.findByIdAndUpdate(id, 
            { 
                title: req.body.listing.title,
                description: req.body.listing.description,
                price: req.body.listing.price,
                location: req.body.listing.location,
                country: req.body.listing.country,
                image: req.file
                    ? { url: req.file.path, filename: req.file.filename }
                    : undefined // Keep existing image if no new file uploaded
            },
            { new: true, runValidators: true } // ✅ Ensure new updated document is returned & validations run
        );

        if (!updatedListing) {
            req.flash("error", "Listing Not Found!");
            return res.redirect("/listings");
        }

        req.flash("success", "Listing Updated Successfully!");
        res.redirect(`/listings/${id}`); // ✅ Redirect to show page instead of listings index
    } catch (error) {
        console.error("❌ Error Updating Listing:", error);
        req.flash("error", "Error Updating Listing!");
        res.redirect(`/listings/${id}/edit`);
    }
});


// Delete Route - Remove a Listing
router.delete("/listings/:id",
    isLoggedIn,
    isOwner,
     async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID"); // ✅ Flash message for invalid ID
        return res.redirect("/listings");
    }

    try {
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing deleted successfully!"); // ✅ Flash message before redirect
        res.redirect("/listings");
    } catch (error) {
        req.flash("error", "Error deleting listing!"); // ✅ Flash message for errors
        res.redirect("/listings");
    }
});


module.exports = router;
