const { Installer, Sysadmin } = require('../models');

async function updateInstallersAndSysadmins(city, installers, sysadmins, transaction) {
  if (installers) {
    const instList = installers
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i);
    for (const instName of instList) {
      const [inst] = await Installer.findOrCreate({
        where: { name: instName },
        transaction,
      });
      await city.addInstaller(inst, { transaction });
    }
  }

  if (sysadmins) {
    const saList = sysadmins
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    for (const saName of saList) {
      const [sa] = await Sysadmin.findOrCreate({
        where: { name: saName },
        transaction,
      });
      await city.addSysadmin(sa, { transaction });
    }
  }
}

module.exports = { updateInstallersAndSysadmins };
