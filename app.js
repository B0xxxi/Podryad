const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
  }),
);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware stub
function authMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

// Route imports
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const cityRoutes = require('./routes/city');
const adminRoutes = require('./routes/admin');

// Routes
app.use('/', authRoutes);
app.use('/search', authMiddleware, searchRoutes);
app.use('/city', authMiddleware, cityRoutes);
app.use('/admin', authMiddleware, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Синхронизация моделей и запуск сервера
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Ошибка при синхронизации базы:', err));
