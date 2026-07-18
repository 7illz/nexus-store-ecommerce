const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const products = require('./data/products');

// Load environment variables so we can connect to the database
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding...'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const importData = async () => {
  try {
    // 1. Clear out any old products to prevent duplicates
    // await Product.deleteMany(); // commented out to prevent wiping the database

    // 2. Find a user to act as the "Admin/Owner" who created these products.
    // We will just grab the first user in your database (which is you!)
    const adminUser = await User.findOne({}); 

    if (!adminUser) {
      console.error("❌ No users found in database! Please log in on the frontend at least once before seeding products.");
      process.exit(1);
    }

    // 3. Attach the adminUser's ObjectId to every sample product
    // (Because your Product Model requires a 'user' field)
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser._id };
    });

    // 4. Insert into the database!
    await Product.insertMany(sampleProducts);

    console.log('✅ Sample Data Successfully Imported!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
importData();