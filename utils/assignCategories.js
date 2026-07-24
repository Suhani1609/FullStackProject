require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");

mongoose.connect(process.env.ATLASDB_URL);

// keyword -> category, checked against each listing's title + description
const keywordMap = [
  { words: ["beach", "coast", "sea", "ocean", "island"], category: "trending" },
  { words: ["pool", "resort"], category: "pools" },
  { words: ["mountain", "hill", "peak", "retreat"], category: "mountains" },
  { words: ["castle", "palace", "fort"], category: "castles" },
  { words: ["camp", "tent", "wild"], category: "camping" },
  { words: ["farm", "ranch", "barn"], category: "farms" },
  { words: ["arctic", "snow", "ice", "glacier"], category: "arctic" },
  { words: ["dome", "igloo"], category: "domes" },
  { words: ["boat", "houseboat", "yacht", "ship"], category: "boats" },
  { words: ["villa", "loft", "apartment", "downtown", "city"], category: "iconic cities" },
  { words: ["cottage", "cabin", "treehouse", "room"], category: "rooms" },
];

// fallback rotation for listings that don't match any keyword
const fallbackCategories = ["trending", "rooms", "iconic cities", "mountains", "castles", "pools", "camping", "farms", "arctic", "domes", "boats"];

function pickCategory(listing, index) {
  const text = `${listing.title} ${listing.description || ""}`.toLowerCase();
  for (let entry of keywordMap) {
    if (entry.words.some(word => text.includes(word))) {
      return entry.category;
    }
  }
  return fallbackCategories[index % fallbackCategories.length];
}

async function assignCategories() {
  const listings = await Listing.find({
    $or: [{ category: { $exists: false } }, { category: null }, { category: "" }],
  });

  console.log(`Found ${listings.length} listings without a category`);

  let i = 0;
  for (let listing of listings) {
    const category = pickCategory(listing, i);
    listing.category = category;
    await listing.save();
    console.log(`Assigned "${category}" to: ${listing.title}`);
    i++;
  }

  console.log("Done.");
  mongoose.connection.close();
}

assignCategories();