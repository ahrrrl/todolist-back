import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const secret = process.env.JWT_SECRET;

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
  const { username } = req.user;
  res.json({ username });
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
    // 액세스 토큰과 리프레시 토큰 생성
    const accessToken = jwt.sign({ userId: user._id, username }, secret, {
      expiresIn: '1h', // 예시: 1시간 유효 기간
    });
    const refreshToken = jwt.sign({ userId: user._id, username }, secret, {
      expiresIn: '7d', // 예시: 7일 유효 기간
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: true, //개발 이후에 true로 바꿀것 -> https에만 쿠키가 전송되게함!
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 (밀리초 단위)
    });
    res.json({ accessToken, username });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }
  try {
    const decoded = jwt.verify(refreshToken, secret);
    const accessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
      secret,
      {
        expiresIn: '1h', // 액세스 토큰의 유효 기간 설정
      }
    );
    res.json({ accessToken, username: decoded.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
