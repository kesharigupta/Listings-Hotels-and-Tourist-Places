const Joi = require("joi");
const review = require("./models/review");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        descraption: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(0).required(), // Changed price to number
        image: Joi.string().allow("", null),
    }).required(),
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        comment: Joi.string().required()

    }).required()
})