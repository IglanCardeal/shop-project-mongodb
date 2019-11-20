const crypto = require("crypto");

module.exports = multer => {
  // Trata upload de arquivos.
  const fileStorage = multer.diskStorage({
    destination: "app/public/users", // local de armazenameto.
    filename: (req, file, callback) => {
      const currentYear = (new Date().getFullYear()).toString();
      const randomFileName =
        crypto.randomBytes(16).toString("hex") + Date.now(); // gera codido de tamanho 16 + 
      callback(null,  randomFileName + ".png");
      // callback(null, new Date().toISOString() + "-" + file.originalname); // nome do arquivo inclui data e hora pra diferenciar os nomes.
    }
  });
  const fileFilter = (req, file, callback) => {
    // filtra por tipo de arquivo.
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  };

  return {
    fileStorage,
    fileFilter
  };
};
