import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const secret = process.env.JWT_SECRET; // 환경 변수로 설정하는 것이 좋습니다

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: 'Error registering user' });
  }
});

router.get('/user', auth, (req, res) => {
  res.send({
    username: req.user.username,
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '24h' });
    res.send({ token, username });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

export default router;
