const crypto = require('crypto');

const destinationBasedOnDate = () => {
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
  const directoryBasedOnDate = destinationBasedOnDate();

  const fileStorage = multer.diskStorage({
    destination: `app/public/users/${directoryBasedOnDate.currentYear}/${directoryBasedOnDate.equivalentMonth}`, // local de armazenameto.
    filename: (req, file, callback) => {
      const randomFileName =
        crypto.randomBytes(16).toString('hex') + Date.now(); // gera codido de tamanho 16 +

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
