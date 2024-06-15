import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  // 헤더에서 토큰 가져오기
  const token = req.header('Authorization');

  // 토큰이 없는 경우
  if (!token) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, secret);

    // 유저 정보를 요청에 추가
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Token is not valid' });
  }
};

export default auth;
