const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_finance_tracker_key_2026';

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ayansayyed137_db_user:cUc5267oiNqYeebN@cluster0.mo5vtpo.mongodb.net/financeTracker?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// ================= USER SCHEMA & MODELS =================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// ================= AUTH MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied! Token nahi mila.' });

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token!' });
  }
};

// ================= TRANSACTION SCHEMA =================
const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, default: 'General' },
  date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// ================= AUTH ROUTES =================

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials!' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email }, message: 'Login successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= TRANSACTION ROUTES =================

// Get User Specific Transactions
app.get('/api/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Transaction with User ID
app.post('/api/transactions', verifyToken, async (req, res) => {
  try {
    const { text, amount, type, category } = req.body;
    const newTransaction = new Transaction({ 
      userId: req.user.id, 
      text, 
      amount, 
      type, 
      category: category || 'General' 
    });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Transaction
app.delete('/api/transactions/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction nahi mili ya unauthorized ho!' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVE FRONTEND STATIC FILES =================
app.use(express.static(path.join(__dirname, '../client/dist')));

// Express 5 / new path-to-regexp compatible route
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
