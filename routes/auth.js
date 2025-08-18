const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const fs = require('fs');
const { Log } = require('../models');
require('dotenv').config();

// Страница входа
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Вход по паролю
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.user = { method: 'password' };
    Log.create({ action: 'login', details: 'Вход по паролю' });
    return res.redirect('/search');
  }
  return res.render('login', { error: 'Неверный пароль' });
});

// Вход по ключ-файлу
router.post('/login-file', upload.single('keyfile'), (req, res) => {
  if (!req.file) {
    return res.render('login', { error: 'Файл не загружен' });
  }
  try {
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const data = JSON.parse(content);
    if (data.key === process.env.KEY_FILE_SECRET) {
      req.session.user = { method: 'file' };
      Log.create({ action: 'login', details: 'Вход по ключ-файлу' });
      fs.unlinkSync(req.file.path);
      return res.redirect('/search');
    } else {
      fs.unlinkSync(req.file.path);
      return res.render('login', { error: 'Неверный ключ-файл' });
    }
  } catch {
    return res.render('login', { error: 'Ошибка обработки файла' });
  }
});

// Выход
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Redirect root to login or search
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/search');
  }
  return res.redirect('/login');
});

module.exports = router;
