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
const session = require("express-session");
const flash = require("connect-flash");


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



const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,

    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};

app.get("/",(req,res) => {
    res.send("Hi, i am root");
});

app.use(session(sessionOptions));
app.use(flash());


app.use((req, res, next )=>{
    res.locals.success = req.flash("success");
    next();
});



app.use("/listings",listing);
app.use("/listings/:id/reviews", review);


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
