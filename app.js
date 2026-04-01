const express = require("express");
const app = express();
const mongoose =require("mongoose");
//const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride =require("method-override");
const ejsMate = require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
//const { listingSchema ,reviewSchema} = require("./schema.js");
//const Review = require("./models/review.js");

const listing = require("./routes/listing.js");
const review = require("./routes/review.js");
//const review = require("./models/review.js");



const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";


main()
.then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await  mongoose.connect(MONGO_URL);
    
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res) => {
    res.send("Hi, i am root");
});






const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

app.use("/listings",listing);
app.use("/listings/:id/reviews", review);









// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "BY the beach",
//         price:1200,
//         location: "Calanguta, Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was save");
//     res.send("successful testing");
// });

app.use( (req, res, next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500 ,message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs" , { message})
    
});


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});