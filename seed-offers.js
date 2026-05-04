const { connectDB } = require("./src/lib/mongodb");
const { Offer } = require("./src/lib/models/Offer");

async function run() {
  await connectDB();
  await Offer.deleteMany({});
  await Offer.insertMany([
    {
      title: "Royal Weekend Feast",
      description: "Get a majestic 20% discount on your favorite platters. Valid on all orders above ₹499.",
      discountValue: 20,
      discountType: "percentage",
      maxDiscount: 500,
      minOrderValue: 499,
      isActive: true,
      isAutoApply: true
    },
    {
      title: "First Royal Bite",
      description: "Experience royalty with ₹150 off on your first major feast. Valid on orders above ₹799.",
      discountValue: 150,
      discountType: "fixed",
      minOrderValue: 799,
      isActive: true,
      isAutoApply: false
    }
  ]);
  console.log("Success: Two royal offers created in DB");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
