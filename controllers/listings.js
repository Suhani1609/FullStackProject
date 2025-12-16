const Listing = require("../models/listing.js");

//map
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = async(req, res) =>{
    res.render("listings/new.ejs");
};

module.exports.showListings = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews", 
            populate: {path: "author"}
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

////it is main create listing before map feature
// module.exports.createListing = async(req, res, next) => {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url,filename};
//     await newListing.save();
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };

module.exports.createListing = async (req, res, next) => {
  try {
    const { location, country } = req.body.listing;

    const geoRes = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        `${location}, ${country}`
      )}&apiKey=${process.env.GEOAPIFY_API_KEY}`
    );

    const geoData = await geoRes.json();

    if (!geoData.features || geoData.features.length === 0) {
      req.flash("error", "Invalid location");
      return res.redirect("/listings/new");
    }

    const coordinates = geoData.features[0].geometry.coordinates;

    const newListing = new Listing(req.body.listing);
    newListing.geometry = {
      type: "Point",
      coordinates
    };
    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    return res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    return next(err);
  }
};

module.exports.editListing = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) =>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};