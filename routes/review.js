const express = require("express");
const router = express.Router({mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema ,reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");



const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//Reviews
//POST review route
router.post("/",  validateReview,wrapAsync( async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);


    listing.reviews.push(newReview._id);
   
    await newReview.save();
    await listing.save();

   res.redirect(`/listings/${listing._id}`);

}));

//Delete  review Route

router.delete("/:reviewId", wrapAsync(async(req,res)=>{
   let {id ,reviewId } = req.params;
   await Review.findByIdAndDelete(reviewId);
   await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   
   

   res.redirect(`/listings/${id}`);

   
})
);

module.exports = router;