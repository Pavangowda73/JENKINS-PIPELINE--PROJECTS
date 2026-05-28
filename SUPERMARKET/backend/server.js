const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const app = express();

app.use(cors());
app.use(express.json());

// 1. DATABASE LINK CONNECTION
const MONGO_URI = process.env.MONGO_URL || "mongodb://admin:admin123@mongodb:27017/supermarket?authSource=admin";
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Database transaction channels successfully initialized.");
    seedProductsIfEmpty();
  })
  .catch(err => console.error("Database initialization crash scenario:", err));

// 2. MONGOOSE SCHEMA LAYOUT STRUCTURES
const User = mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  membership: { type: String, default: "Standard" }
}));

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  stock: Number,
  image: String
}));

const Cart = mongoose.model("Cart", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1 }
  }]
}));

const Order = mongoose.model("Order", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: Array,
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now }
}));

// 3. INVENTORY SEED PROCESSOR
async function seedProductsIfEmpty() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const freshSeededItems = [
        { name: "Organic Honeycrisp Apples (1kg)", price: 4.99, category: "Fruits", stock: 120, image: "🍎" },
        { name: "Fresh Whole Milk (1L)", price: 2.49, category: "Dairy", stock: 85, image: "🥛" },
        { name: "Artisan Sourdough Bread", price: 3.99, category: "Bakery", stock: 40, image: "🍞" },
        { name: "Organic Baby Spinach (250g)", price: 2.99, category: "Vegetables", stock: 60, image: "🥬" }
      ];
      await Product.insertMany(freshSeededItems);
      console.log("Supermarket product collection initialized with inventory constants.");
    }
  } catch (err) {
    console.error("Seeding operation failed:", err);
  }
}

// 4. REST ROUTING ENDPOINTS
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, membership } = req.body;
    const validationLookup = await User.findOne({ email });
    if (validationLookup) return res.status(400).json({ message: "Identity constraints conflict. Email exists." });

    const protectedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: protectedPassword, membership });
    await user.save();

    const cart = new Cart({ userId: user._id, items: [] });
    await cart.save();

    res.status(201).json({ message: "Registration trace written successfully.", userId: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Internal failure executing identity routing.", error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    res.json({ message: "Login criteria passed.", userId: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    res.json(await Product.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cart/add", async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.productId && item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }
    await cart.save();
    res.json({ message: "Item appended into cart array object.", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const executionModel = await Cart.findOne({ userId: req.params.userId }).populate("items.productId");
    res.json(executionModel || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/checkout", async (req, res) => {
  const { userId } = req.body;
  try {
    const targetedCart = await Cart.findOne({ userId }).populate("items.productId");
    if (!targetedCart || targetedCart.items.length === 0) return res.status(400).json({ message: "Cart trace empty." });

    let calculatedSum = 0;
    const summaryInvoiceItems = targetedCart.items.map(item => {
      if (item.productId) {
        calculatedSum += item.productId.price * item.quantity;
        return { productName: item.productId.name, price: item.productId.price, quantity: item.quantity };
      }
    }).filter(Boolean);

    const historicalRecord = new Order({ userId, items: summaryInvoiceItems, totalAmount: calculatedSum });
    await historicalRecord.save();

    targetedCart.items = [];
    await targetedCart.save();

    res.status(201).json({ message: "Checkout operational loop terminated successfully.", order: historicalRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`API Backend operational on port ${PORT}`));
