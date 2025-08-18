const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');
const { City, Installer, Sysadmin, Log, sequelize } = require('../models');

const { updateInstallersAndSysadmins } = require('./helpers');

// Настройка загрузки файлов
const upload = multer({ dest: 'public/uploads/' });

// Главная админ-панели
router.get('/', (req, res) => {
  res.render('admin/index');
});

// GET импорт XLSX
router.get('/upload', (req, res) => {
  res.render('admin/upload', { error: null, success: null });
});

// POST импорт XLSX
router.post('/upload', upload.single('xlsxfile'), async (req, res) => {
  if (!req.file) {
    return res.render('admin/upload', {
      error: 'Файл не загружен',
      success: null,
    });
  }
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    await sequelize.transaction(async (t) => {
      for (const row of rows) {
        const name = row['Город'];
        if (!name) continue;
        const [city] = await City.findOrCreate({
          where: { name },
          transaction: t,
        });
        city.ddx = !!row['DDX'];
        city.myuz = !!row['МЮЗ'];
        await city.save({ transaction: t });
        await updateInstallersAndSysadmins(
          city,
          row['Монтажники'],
          row['Сисадмины'],
          t,
        );
      }
    });
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString(
      'utf8',
    );
    await Log.create({
      action: 'import_xlsx',
      details: `Импорт из файла ${originalName}`,
    });
    fs.unlinkSync(req.file.path);
    res.render('admin/upload', {
      error: null,
      success: 'Импорт успешно завершён',
    });
  } catch (err) {
    console.error(err);
    res.render('admin/upload', { error: 'Ошибка импорта', success: null });
  }
});

// GET ручное добавление
router.get('/add', (req, res) => {
  res.render('admin/add', { error: null, success: null });
});

// POST ручное добавление
router.post('/add', async (req, res) => {
  const { name, ddx, myuz, installers, sysadmins } = req.body;
  if (!name) {
    return res.render('admin/add', {
      error: 'Название города обязательно',
      success: null,
    });
  }
  try {
    await sequelize.transaction(async (t) => {
      const [city] = await City.findOrCreate({
        where: { name },
        transaction: t,
      });
      city.ddx = ddx === 'on';
      city.myuz = myuz === 'on';
      await city.save({ transaction: t });
      await updateInstallersAndSysadmins(city, installers, sysadmins, t);
    });
    await Log.create({
      action: 'add_record',
      details: `Ручное добавление города ${name}`,
    });
    res.render('admin/add', { error: null, success: 'Запись добавлена' });
  } catch (err) {
    console.error(err);
    res.render('admin/add', {
      error: 'Ошибка при добавлении записи',
      success: null,
    });
  }
});

// Просмотр логов
router.get('/logs', async (req, res) => {
  const logs = await Log.findAll({ order: [['createdAt', 'DESC']] });
  res.render('admin/logs', { logs });
});

// Список городов
router.get('/cities', async (req, res) => {
  const cities = await City.findAll({ order: [['name', 'ASC']] });
  res.render('admin/cities', { cities });
});

// Удаление города
router.post('/cities/:id/delete', async (req, res) => {
  const cityId = req.params.id;
  try {
    await sequelize.transaction(async (t) => {
      const city = await City.findByPk(cityId, { transaction: t });
      if (!city) {
        return res.status(404).render('404');
      }
      // Сброс связей
      await city.setInstallers([], { transaction: t });
      await city.setSysadmins([], { transaction: t });
      const cityName = city.name;
      await city.destroy({ transaction: t });
      await Log.create(
        {
          action: 'delete_city',
          details: `Удаление города ${cityName} (id: ${cityId})`,
        },
        { transaction: t },
      );
    });
    res.redirect('/admin/cities');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/cities');
  }
});

module.exports = router;
