import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  // 헤더에서 토큰 가져오기
  const authHeader = req.header('Authorization');

  // 토큰이 없는 경우
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  // Bearer 스키마 제거 후 토큰 추출
  const token = authHeader.split(' ')[1];

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, secret);

    // 유저 정보를 요청에 추가
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    // 토큰 유효성 검사 실패
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    // 토큰 만료
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token is expired' });
    }
    // 기타 오류
    return res.status(500).json({ message: 'Server error' });
  }
};

export default auth;
