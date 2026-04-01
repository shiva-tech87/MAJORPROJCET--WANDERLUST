const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema ,reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");


const validateListing = (req,res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//index rout
router.get("/", async (req, res) => {
  const allListings = await  Listing.find({});
  res.render("./listings/index.ejs",{allListings });
});

//new route
router.get("/new",  (req, res)=>{
    res.render("listings/new.ejs");
});

//show rout
router.get("/:id",  wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("",
    wrapAsync(async (req ,res, next)=>{
    let result = listingSchema.validate(req.body);
    if(result.error){     
    throw new ExpressError (400,"send valid data for listing");   
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);


//edit route
router.get("/:id/edit",  wrapAsync(async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" ,{ listing });

}));

//update route
router.put("/:id/", wrapAsync (async (req,res)=>{
     if(!req.body.listen){
            throw new ExpressError (400,"send valid data for listing");
        }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);

}));

//delete route
router.delete("/:id", wrapAsync(async(req,res)=>{
     let {id} = req.params;
     let deleteListings = await Listing.findByIdAndDelete(id);
     console.log(deleteListings);
     res.redirect("/listings");
})); 

module.exports = router;