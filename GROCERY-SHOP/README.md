Here are all the files from the project document formatted in individual copyable code blocks, organized by their directory structure so you can easily replicate the file layout. 

---

## 1. Project Directory Architecture

Maintain this precise file layout within your Ubuntu directory structure: 

```plaintext
~/project/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── public/
│       ├── index.html
│       └── shop.html
└── backend/
    ├── Dockerfile
    ├── package.json
    └── server.js

```



---

## 2. Frontend Repository Implementation

File: `~/project/frontend/package.json` 

```json
{
  "name": "grocery-frontend-portal",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}

```



File: `~/project/frontend/server.js` 

```javascript
const express = require("express");
const path = require("path");
const app = express();

const PORT = 3000;

// Dynamic configuration endpoint for the client browser
app.get("/config.js", (req, res) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  res.setHeader("Content-Type", "application/javascript");
  res.send(`window.API_BASE_URL = "${backendUrl}";`);
});

// Serve static elements after config route definitions
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Web server statically serving components on port ${PORT}`);
});

```



File: `~/project/frontend/Dockerfile` 

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["node","server.js"]

```



File: `~/project/frontend/public/index.html` 

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FreshCart - Entry Portal</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: 'Segoe UI', sans-serif; }
        body { min-height:100vh; display: flex; justify-content:center; align-items:center; background:#0f172a; color:#f8fafc; }
        .box { background:rgba(255,255,255,0.06); padding:40px; border-radius:20px; width:400px; border:1px solid rgba(255,255,255,0.1); }
        h2 { text-align:center; margin-bottom:20px; color:#10b981; }
        input, select { width:100%; padding: 14px; margin-bottom:15px; background:#1e293b; border:1px solid #334155; border-radius:10px; color:white; font-size:0.95rem; }
        button { width:100%; padding: 14px; background:#10b981; border:none; color:white; font-weight:bold; border-radius:10px; cursor:pointer; font-size:1rem; transition:0.2s; }
        button:hover { background:#059669; }
        .toggle-link { text-align:center; margin-top:15px; color:#94a3b8; cursor:pointer; font-size:0.9rem; }
    </style>
    <script src="/config.js"></script>
</head>
<body>
    <div class="box">
        <h2 id="title"><i class="fa-solid fa-basket-shopping"></i> Create Account</h2>
        <form id="authForm">
            <input type="text" id="nameInput" placeholder="Full Name" required>
            <input type="email" id="emailInput" placeholder="Email Address" required>
            <input type="password" id="passInput" placeholder="Password (min 6 chars)" required>
            <select id="tierInput">
                <option value="Standard">Standard Tier</option>
                <option value="Gold VIP">Gold VIP (10% Discount)</option>
            </select>
            <button type="submit" id="btnText">Sign Up</button>
        </form>
        <div class="toggle-link" id="toggleMode" onclick="switchMode()">Already a member? Sign In</div>
    </div>

    <script>
        let isRegisterMode = true;
        // Use the injected configuration object variable falling back gracefully
        const API_URL = (window.API_BASE_URL || "http://localhost:5000") + "/api/auth";

        function switchMode() {
            isRegisterMode = !isRegisterMode;
            document.getElementById("title").innerHTML = isRegisterMode ? '<i class="fa-solid fa-basket-shopping"></i> Create Account' : '<i class="fa-solid fa-lock"></i> Welcome Back';
            document.getElementById("nameInput").style.display = isRegisterMode ? "block" : "none";
            document.getElementById("nameInput").required = isRegisterMode;
            document.getElementById("tierInput").style.display = isRegisterMode ? "block" : "none";
            document.getElementById("btnText").innerText = isRegisterMode ? "Sign Up" : "Sign In";
            document.getElementById("toggleMode").innerText = isRegisterMode ? "Already a member? Sign In" : "Don't have an account? Sign Up";
        }

        document.getElementById("authForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const endpoint = isRegisterMode ? "/register" : "/login";
            const payload = {
                email: document.getElementById("emailInput").value,
                password: document.getElementById("passInput").value
            };
            if(isRegisterMode) {
                payload.name = document.getElementById("nameInput").value;
                payload.membership = document.getElementById("tierInput").value;
            }
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if(!res.ok) throw new Error(data.message || "Execution exception error.");
                localStorage.setItem("market_userId", data.userId);
                localStorage.setItem("market_userName", data.name);
                alert(data.message);
                window.location.href = "shop.html";
            } catch(err) {
                alert(err.message);
            }
        });
    </script>
</body>
</html>

```



File: `~/project/frontend/public/shop.html` 

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FreshCart E-Storefront</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: 'Segoe UI', sans-serif; }
        body { background:#0f172a; color:#f8fafc; display:flex; flex-direction:column; min-height:100vh; }
        header { background:#022c22; padding:20px; display: flex; justify-content:space-between; align-items:center; border-bottom:3px solid #10b981; }
        .main-layout { display:grid; grid-template-columns: 2fr 1fr; gap:20px; padding:30px; flex:1; }
        .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:20px; }
        .card { background:#1e293b; border-radius:15px; padding:20px; text-align:center; border:1px solid #334155; }
        .card .icon { font-size:3.5rem; margin-bottom:10px; display:inline-block; }
        .card h3 { margin-bottom:8px; font-size:1.1rem; color:#e2e8f0; }
        .price { color:#34d399; font-weight:bold; font-size:1.2rem; margin-bottom:12px; }
        .add-btn { background:#10b981; border:none; color:white; padding:10px 15px; border-radius:8px; cursor:pointer; font-weight:600; width:100%; transition:0.2s; }
        .add-btn:hover { background:#059669; }
        .cart-panel { background:#1e293b; border-radius: 15px; padding:25px; border:1px solid #334155; display:flex; flex-direction:column; height:fit-content; }
        .cart-title { border-bottom:1px solid #334155; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
        .cart-item { display: flex; justify-content:space-between; margin-bottom: 12px; font-size:0.95rem; background:#0f172a; padding:10px; border-radius:8px; }
        .total-box { margin-top:20px; border-top:1px solid #334155; padding-top:15px; font-size:1.2rem; font-weight:bold; display:flex; justify-content:space-between; }
        .checkout-btn { width:100%; margin-top:15px; padding:14px; background:linear-gradient(90deg, #10b981, #059669); border:none; color:white; font-weight:bold; border-radius:10px; cursor:pointer; font-size:1rem; transition:0.2s; }
        .checkout-btn:hover { transform: translateY(-2px); }
        .logout-btn { background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .logout-btn:hover { background: #dc2626; }
    </style>
    <script src="/config.js"></script>
</head>
<body>
    <header>
        <h2><i class="fa-solid fa-leaf"></i> FreshCart Market Layout</h2>
        <div style="display:flex; align-items:center; gap:20px;">
            <div id="userInfo" style="font-weight:500;">User Node: Guest</div>
            <button class="logout-btn" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
        </div>
    </header>
    <div class="main-layout">
        <div>
            <h3 style="margin-bottom:20px; color:#94a3b8;"><i class="fa-solid fa-store"></i> Available Groceries</h3>
            <div class="grid" id="productsCatalog"></div>
        </div>
        <div class="cart-panel">
            <div class="cart-title">
                <h3><i class="fa-solid fa-cart-shopping"></i> Cart Summary</h3>
                <span id="itemCount" style="background:#10b981; padding:2px 8px; border-radius:12px; font-size:0.8rem;">0 Units</span>
            </div>
            <div id="cartContents" style="flex:1;"></div>
            <div class="total-box">
                <span>Aggregate Total:</span>
                <span id="cartTotal" style="color:#34d399;">$0.00</span>
            </div>
            <button class="checkout-btn" onclick="executeCheckout()"><i class="fa-solid fa-bag-shopping"></i> Complete Checkout Loop</button>
        </div>
    </div>

    <script>
        const BASE_API = (window.API_BASE_URL || "http://localhost:5000") + "/api";
        const userId = localStorage.getItem("market_userId");
        const userName = localStorage.getItem("market_userName");

        if(!userId) {
            window.location.href = "index.html";
        } else {
            document.getElementById("userInfo").innerHTML = `<i class="fa-solid fa-user-circle"></i> Node Active: ${userName}`;
        }

        function logout() {
            localStorage.clear();
            window.location.href = "index.html";
        }

        async function fetchCatalog() {
            const res = await fetch(`${BASE_API}/products`);
            const products = await res.json();
            const catalogDiv = document.getElementById("productsCatalog");
            catalogDiv.innerHTML = "";
            products.forEach(p => {
                catalogDiv.innerHTML += `
                <div class="card">
                <span class="icon">${p.image || '🛒'}</span>
                <h3>${p.name}</h3>
                <div class="price">$${p.price.toFixed(2)}</div>
                <button class="add-btn" onclick="addToCart('${p._id}')"><i class="fa-solid fa-plus"></i> Add item</button>
                </div>`;
            });
        }

        async function addToCart(productId) {
            await fetch(`${BASE_API}/cart/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, productId })
            });
            renderCart();
        }

        async function renderCart() {
            const res = await fetch(`${BASE_API}/cart/${userId}`);
            const cart = await res.json();
            const container = document.getElementById("cartContents");
            container.innerHTML = "";
            let total = 0;
            let totalCount = 0;

            if(!cart.items || cart.items.length === 0) {
                container.innerHTML = '<div style="color:#64748b; text-align:center; margin-top:20px;">Cart array slice is currently empty.</div>';
            } else {
                cart.items.forEach(item => {
                    const p = item.productId;
                    if(p) {
                        const cost = p.price * item.quantity;
                        total += cost;
                        totalCount += item.quantity;
                        container.innerHTML += `
                        <div class="cart-item">
                        <div><strong>${p.name}</strong><br><small style="color:#94a3b8;">Qty: ${item.quantity} × $${p.price.toFixed(2)}</small></div>
                        <div style="font-weight:600; align-self:center;">$${cost.toFixed(2)}</div>
                        </div>`;
                    }
                });
            }
            document.getElementById("cartTotal").innerText = `$${total.toFixed(2)}`;
            document.getElementById("itemCount").innerText = `${totalCount} Units`;
        }

        async function executeCheckout() {
            const res = await fetch(`${BASE_API}/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if(res.ok) {
                alert(`Transaction Success! Processing Order Total of: $${data.order.totalAmount.toFixed(2)}`);
                renderCart();
            } else {
                alert(data.message);
            }
        }

        fetchCatalog();
        renderCart();
    </script>
</body>
</html>

```



---

## 3. Backend Repository Implementation

File: `~/project/backend/package.json` 

```json
{
  "name": "grocery-backend-api",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "mongoose": "^8.3.4"
  }
}

```



File: `~/project/backend/server.js` 

```javascript
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

```



File: `~/project/backend/Dockerfile` 

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY --from=builder /app ./
EXPOSE 5000
CMD ["node","server.js"]

```



---

4. Production Compilation & Deployment Pipeline Execution 

Login to your AWS EC2 instance: 

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

```



Step 1: Initialize System Packages and Directories 

```bash
sudo apt update && sudo apt install docker.io -y
sudo systemctl enable docker && sudo systemctl start docker
sudo usermod -aG docker ubuntu
newgrp docker

# Build the directory framework structure
mkdir -p ~/project/frontend/public ~/project/backend

```

*(Populate files inside these locations using nano or your transfer pipeline before continuing).* 

Step 2: Build Container System Components 

```bash
# Build Backend Image
cd ~/project/backend && docker build -t market-backend-image .

# Build Frontend Image
cd ~/project/frontend && docker build -t market-frontend-image .

```



Step 3: Run the Multi-Container Lifecycle Architecture 

Create an isolated Docker network bridgespace so components can seamlessly discover one another: 

```bash
docker network create supermarket-network

```



Run MongoDB: 

```bash
docker run -d \
--name mongodb \
--network supermarket-network \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=admin123 \
mongo:latest

```



Run Backend Core Framework: 

```bash
docker run -d \
--name market-api-container \
--network supermarket-network \
-p 5000:5000 \
-e MONGO_URL="mongodb://admin:admin123@mongodb:27017/supermarket?authSource=admin" \
market-backend-image

```



Run Frontend Dynamic Portal Server: *(CRITICAL: Replace YOUR_EC2_PUBLIC_IP with your actual EC2 Instance's public IPv4 address like [http://54.210.45.12:5000](http://54.210.45.12:5000) to ensure browser queries reach your open port 5000 firewall configuration).* 

```bash
docker run -d \
--name market-web-container \
--network supermarket-network \
-p 3000:3000 \
-e BACKEND_URL="http://YOUR_EC2_PUBLIC_IP:5000" \
market-frontend-image

```
