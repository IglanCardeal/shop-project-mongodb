const crypto = require('crypto');
const path = require('path');

const directoryBasedOnDate = () => {
  const date = new Date();

  const currentYear = date.getFullYear().toString();

  const months = [
    'jan',
    'feb',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  const equivalentMonth = months[date.getMonth().toString()];

  return {
    currentYear,
    equivalentMonth,
  };
};

module.exports = multer => {
  // Trata upload de arquivos.
  const { currentYear, equivalentMonth } = directoryBasedOnDate();

  const fileStorage = multer.diskStorage({
    // destination: `app/public/users/${currentYear}/${equivalentMonth}`, // local de armazenameto.
    destination: path.join(
      'app',
      'public',
      'users',
      currentYear.toString(),
      equivalentMonth.toString()
    ),
    filename: (req, file, callback) => {
      const randomFileName =
        crypto.randomBytes(16).toString('hex') + Date.now();

      callback(null, `${randomFileName}.png`);
    },
  });

  const fileFilter = (req, file, callback) => {
    // filtra por tipo de arquivo.
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  };

  return {
    fileStorage,
    fileFilter,
  };
};
