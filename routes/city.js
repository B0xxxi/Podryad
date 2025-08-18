const express = require('express');
const router = express.Router();
const { City, Installer, Sysadmin } = require('../models');

// GET /city/:id - подробности по городу
router.get('/:id', async (req, res) => {
  const city = await City.findByPk(req.params.id, {
    include: [Installer, Sysadmin],
  });
  if (!city) {
    return res.status(404).render('404');
  }
  res.render('city', { city });
});

module.exports = router;
