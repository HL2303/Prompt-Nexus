const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Resend } = require('resend');
const cron = require('node-cron');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- INITIALIZE APP & SERVICES ---
const app = express();
const PORT = process.env.PORT || 5001;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const resend = new Resend(process.env.RESEND_API_KEY);

// --- MIDDLEWARE ---
const corsOptions = { origin: 'http://localhost:5173', optionsSuccessStatus: 200 };
app.use(cors(corsOptions));
app.use(express.json());

// --- DATABASE CONNECTION ---
const uri = process.env.ATLAS_URI;
mongoose.connect(uri).then(() => console.log("MongoDB connected")).catch(err => console.error("MongoDB connection error:", err));

// --- SCHEMAS & MODELS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 500 },
  plan: { type: String, default: 'Free' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
});
const User = mongoose.model('User', userSchema);

const promptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalText: { type: String, required: true },
  generatedPrompt: { type: String, required: true },
  promptType: { type: String, required: true, enum: ['image', 'text', 'video', 'website', 'code'] },
  createdAt: { type: Date, default: Date.now }
});
const Prompt = mongoose.model('Prompt', promptSchema);

// --- AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_jwt_secret');
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid.' });
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user = new User({ name, email, password: hashedPassword, verificationToken });
    await user.save();
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Verify Your Email for AI Prompt Generator',
      html: `<p>Hi ${user.name},</p><p>Please click the link below to verify your email address:</p><a href="${verificationUrl}">Verify Email</a>`,
    });
    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields.' });
    }
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        if (!user.isVerified) {
          return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'your_default_jwt_secret', { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified.' });
    }
    const verificationUrl = `http://localhost:5173/verify-email?token=${user.verificationToken}`;
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Verify Your Email for AI Prompt Generator',
      html: `<p>Hi ${user.name},</p><p>Here is your verification link:</p><a href="${verificationUrl}">Verify Email</a>`,
    });
    if (error) {
      console.error("!!! RESEND API ERROR (Resend) !!!", error);
      return res.status(500).json({ message: 'Failed to resend verification email.' });
    }
    res.json({ message: 'A new verification email has been sent.' });
  } catch (err) {
    console.error("!!! SERVER ERROR (Resend) !!!", err);
    res.status(500).send('Server error while resending email.');
  }
});

app.get('/api/auth/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- USER PROFILE ROUTES ---
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select('-password');
    res.json({ message: 'Profile updated successfully.', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/user/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new passwords.' });
  }
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- PAYMENT ROUTES ---
app.post('/api/payment/orders', authMiddleware, async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  if (!amount) {
    return res.status(400).json({ message: 'Amount is required.' });
  }
  try {
    const options = { amount: amount * 100, currency, receipt: `receipt_order_${new Date().getTime()}` };
    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).send('Error creating Razorpay order.');
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/api/payment/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, creditsToAdd, planName } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !creditsToAdd || !planName) {
    return res.status(400).json({ message: 'Missing payment verification details.' });
  }
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.credits += creditsToAdd;
    user.plan = planName;
    await user.save();
    res.json({ success: true, message: 'Payment successful! Plan updated and credits added.', newCreditBalance: user.credits });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- PROMPT ROUTES ---
app.get('/api/prompts', authMiddleware, async (req, res) => {
    try {
        const prompts = await Prompt.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(prompts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching prompts.' });
    }
});

app.post('/api/generate', authMiddleware, async (req, res) => {
    const { text, type } = req.body; 
    if (!text || !type) {
        return res.status(400).json({ message: 'Text input and a generator type are required.' });
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.credits < 60) return res.status(403).json({ message: 'You do not have enough credits.' });
        
        // **FIXED**: New, stricter instructions for the AI
        let geminiSystemPrompt = '';
        const baseInstruction = `
          You are an AI assistant that generates creative prompts. 
          Your task is to take a user's idea and expand it into a single, detailed prompt.
          YOUR RESPONSE MUST BE ONLY THE PROMPT TEXT ITSELF. 
          DO NOT include any introductory phrases, explanations, or conversational text like "Here is your prompt:".
        `;

        switch (type) {
          case 'image': geminiSystemPrompt = `${baseInstruction} The prompt should be for an AI image generator. The user's idea is: "${text}"`; break;
          case 'text': geminiSystemPrompt = `${baseInstruction} The prompt should be a story starter for an AI text generator. The user's idea is: "${text}"`; break;
          case 'video': geminiSystemPrompt = `${baseInstruction} The prompt should be a scene description for an AI video generator. The user's idea is: "${text}"`; break;
          case 'website': geminiSystemPrompt = `${baseInstruction} The prompt should describe the UI/UX for a website landing page for a generative UI tool. The user's idea is: "A landing page for ${text}"`; break;
          case 'code': geminiSystemPrompt = `${baseInstruction} The prompt should be a clear instruction for a code generation tool. The user's idea is: "A function that ${text}"`; break;
          default: return res.status(400).json({ message: 'Invalid generator type specified.' });
        }
        
        const result = await model.generateContent(geminiSystemPrompt);
        const response = await result.response;
        const generatedPrompt = response.text().trim();
        
        user.credits -= 60;
        await user.save();
        
        const newPrompt = new Prompt({ userId: req.user.id, originalText: text, generatedPrompt: generatedPrompt, promptType: type });
        await newPrompt.save();
        
        res.status(201).json({ success: true, generatedPrompt: generatedPrompt, newCreditBalance: user.credits });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ message: 'Failed to generate prompt.' });
    }
});

// --- DAILY CREDIT REFRESH ---
cron.schedule('0 0 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running daily credit reset job...`);
  try {
    const usersToUpdate = await User.find({ plan: { $in: ['Starter Pack', 'Pro Pack', 'Mega Pack'] } });
    for (const user of usersToUpdate) {
      let dailyCredits = 0;
      if (user.plan === 'Starter Pack') dailyCredits = 1000;
      if (user.plan === 'Pro Pack') dailyCredits = 2500;
      if (user.plan === 'Mega Pack') dailyCredits = 10000;
      user.credits = dailyCredits;
      await user.save();
      console.log(`Reset credits for user: ${user.email}`);
    }
    console.log('Daily credit reset job finished.');
  } catch (err) {
    console.error('Error during daily credit reset job:', err);
  }
}, { timezone: "Asia/Kolkata" });

// --- START SERVER ---
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
