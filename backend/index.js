require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// اتصال MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/file_uploader', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// تعريف نماذج Mongoose
const fileSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  size: Number,
  mimeType: String,
  path: String,
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);

// موديل للمستخدمين
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);



//////////
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Überprüfen, ob der Benutzername bereits existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Benutzername bereits vergeben' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Neuen Benutzer erstellen
    const newUser = new User({
      username,
      password: hashedPassword,                 
    });

    // Benutzer speichern
    await newUser.save();
    res.status(201).json({ message: 'Benutzer erfolgreich registriert' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});
//////////
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ token });
});

// حماية API باستخدام JWT
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
};
// رفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// رفع الملفات باستخدام Multer
app.post('/upload', authenticate, upload.array('files', 10), async (req, res) => {
  // نفس الكود السابق للرفع
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});

