const express = require('express');
const router = express.Router();
const { City, Installer, Sysadmin } = require('../models');

// GET /search?q=... - форма поиска и результаты
router.get('/', async (req, res) => {
  const q = req.query.q;
  let cities = [];
  if (q) {
    // 1. Загружаем все города
    const allCities = await City.findAll({
      include: [Installer, Sysadmin],
    });

    const qLower = q.toLowerCase();

    // 2. Фильтруем в JavaScript
    cities = allCities.filter((city) =>
      city.name.toLowerCase().includes(qLower),
    );

    // 3. Сортируем в JavaScript
    cities.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aExact = aName === qLower,
        bExact = bName === qLower;
      if (aExact !== bExact) return aExact ? -1 : 1;
      const aPrefix = aName.startsWith(qLower),
        bPrefix = bName.startsWith(qLower);
      if (aPrefix !== bPrefix) return aPrefix ? -1 : 1;
      return aName.localeCompare(bName);
    });
  }
  res.render('search', { cities, q });
});

module.exports = router;
