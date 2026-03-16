const express = require("express");
const app = express();
const mongoose =require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride =require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


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


//index rout
app.get("/listings", async (req, res) => {
  const allListings = await  Listing.find({});
  res.render("./listings/index.ejs",{allListings });
});

//new route
app.get("/listings/new",  (req, res)=>{
    res.render("listings/new.ejs");
});

//show rout
app.get("/listings/:id",  wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings",
    wrapAsync(async (req ,res, next)=>{
        if(!req.body.listen){
            throw new ExpressError (400,"send valid data for listing");
        }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);


//edit route
app.get("/listings/:id/edit",  wrapAsync(async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" ,{ listing });

}));

//update route
app.put("/listings/:id/", wrapAsync (async (req,res)=>{
     if(!req.body.listen){
            throw new ExpressError (400,"send valid data for listing");
        }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);

}));

//delete route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
     let {id} = req.params;
     let deleteListings = await Listing.findByIdAndDelete(id);
     console.log(deleteListings);
     res.redirect("/listings");
}));





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
    res.status(statusCode).send(message);
});


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});