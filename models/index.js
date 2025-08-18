const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Инициализация Sequelize с SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/database.sqlite'),
  logging: false,
});

// Модель города
const City = sequelize.define('City', {
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  ddx: { type: DataTypes.BOOLEAN, defaultValue: false },
  myuz: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Модель монтажника
const Installer = sequelize.define('Installer', {
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

// Модель сисадмина
const Sysadmin = sequelize.define('Sysadmin', {
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

// Многие-ко-многим: города <-> монтажники
City.belongsToMany(Installer, { through: 'CityInstallers' });
Installer.belongsToMany(City, { through: 'CityInstallers' });

// Многие-ко-многим: города <-> сисадмины
City.belongsToMany(Sysadmin, { through: 'CitySysadmins' });
Sysadmin.belongsToMany(City, { through: 'CitySysadmins' });

// Логи админ-панели
const Log = sequelize.define('Log', {
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT },
});

module.exports = { sequelize, City, Installer, Sysadmin, Log };
