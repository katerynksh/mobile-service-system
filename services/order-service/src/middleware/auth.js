const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // 1. Отримуємо заголовок Authorization
    const authHeader = req.headers.authorization;

    // 2. Перевіряємо, чи є заголовок і чи починається він з 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required. Format: Bearer <token>' 
      });
    }

    // 3. Дістаємо сам токен (відкидаємо слово 'Bearer ')
    const token = authHeader.split(' ')[1];

    // 4. Перевіряємо токен за допомогою секретного ключа
    // JWT_SECRET береться з твого файлу .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Зберігаємо розшифровані дані (id, role тощо) в об'єкт запиту
    req.user = decoded;

    // 6. Пропускаємо запит далі до контролера
    next();
  } catch (error) {
    // Обробка специфічної помилки, коли час життя токена вийшов
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired' 
      });
    }

    // Обробка будь-яких інших помилок валідації (підроблений токен, неправильний секрет тощо)
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Мідлвар для перевірки ролей (RBAC).
 * Приймає список дозволених ролей і перевіряє, чи має користувач одну з них.
 * Важливо: цей мідлвар має викликатися ТІЛЬКИ ПІСЛЯ authenticate!
 * * @param  {...string} roles - список ролей (наприклад, 'master', 'client')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // Перевіряємо, чи взагалі є req.user (чи відпрацював authenticate)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    // Перевіряємо, чи є роль користувача в списку дозволених
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions. Access denied.' 
      });
    }

    // Якщо роль підходить — пропускаємо далі
    next();
  };
};

module.exports = {
  authenticate,
  requireRole
};