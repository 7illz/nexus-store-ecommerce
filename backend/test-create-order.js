const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOne({});
  const product = await Product.findOne({});
  
  if (!user || !product) {
    console.log("No user or product found");
    process.exit(1);
  }

  // Create a mock request
  const req = {
    user: user,
    body: {
      orderItems: [
        {
          name: product.name,
          qty: 1,
          image: product.image,
          price: product.price,
          product: product._id
        }
      ],
      shippingAddress: {
        address: '123 Fake St',
        city: 'Fakeville',
        postalCode: '12345',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      taxPrice: 10,
      shippingPrice: 5,
      totalPrice: product.price + 15
    }
  };

  const res = {
    status: (code) => ({
      json: (data) => console.log(`Status ${code}:`, data)
    }),
    json: (data) => console.log('JSON:', data)
  };

  const { addOrderItems } = require('./controllers/orderController');
  await addOrderItems(req, res);
  
  console.log("Done");
  process.exit(0);
};

run();
