/**
 * JWT 认证中间件
 * 用于验证用户的 JWT Token
 */

const jwt = require('jsonwebtoken');

// JWT 密钥（生产环境应该从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Token 有效期

/**
 * 生成 JWT Token
 * @param {Object} payload - Token 载荷（用户信息）
 * @returns {string} JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT Token
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的用户信息，验证失败返回 null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 认证中间件
 * 从请求头中提取 Token 并验证
 */
function authMiddleware(req, res, next) {
  try {
    // 从 Authorization 头中提取 Token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: '无效的认证令牌' });
    }

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({ error: '认证失败' });
  }
}

/**
 * 可选认证中间件
 * Token 存在时验证，不存在时也允许通过
 */
function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    next();
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  optionalAuthMiddleware,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
