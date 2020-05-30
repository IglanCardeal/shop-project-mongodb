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
    destination: path.join(
      'app',
      'public',
      'users',
      currentYear.toString(),
      equivalentMonth.toString()
    ),
    filename: (req, file, callback) => {
      // mantem o formato original da imagem.
      const randomFileName =
        crypto.randomBytes(16).toString('hex') + Date.now();
      const fileFormat = file.mimetype.split('/')[1];
      const finalFileName = `${randomFileName}.${fileFormat}`;

      callback(null, finalFileName);
    },
  });

  const fileFilter = (req, file, callback) => {
    const acceptedFormatTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const isValidFormatType = acceptedFormatTypes.includes(file.mimetype);

    if (isValidFormatType) callback(null, true);
    else callback(null, false);
  };

  return {
    fileStorage,
    fileFilter,
  };
};
