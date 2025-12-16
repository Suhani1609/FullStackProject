require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const axios = require("axios");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;

async function addGeometry() {
  const listings = await Listing.find({ geometry: { $exists: false } });

  console.log(`Found ${listings.length} listings without geometry`);

  for (let listing of listings) {
    const location = `${listing.location}, ${listing.country}`;

    const geoRes = await axios.get(
      "https://api.geoapify.com/v1/geocode/search",
      {
        params: {
          text: location,
          apiKey: GEOAPIFY_KEY
        }
      }
    );

    if (geoRes.data.features.length) {
      const coords = geoRes.data.features[0].geometry.coordinates;

      listing.geometry = {
        type: "Point",
        coordinates: coords
      };

      await listing.save();
      console.log(`✔ Updated: ${listing.title}`);
    } else {
      console.log(`❌ Not found: ${listing.title}`);
    }
  }

  mongoose.connection.close();
}

addGeometry();
