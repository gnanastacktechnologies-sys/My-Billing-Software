const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { invoicePrefix, invoiceStartNumber } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ invoicePrefix, invoiceStartNumber });
    } else {
      settings.invoicePrefix = invoicePrefix || settings.invoicePrefix;
      if (invoiceStartNumber) {
         settings.invoiceStartNumber = invoiceStartNumber;
      }
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
