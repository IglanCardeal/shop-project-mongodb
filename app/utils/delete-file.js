const fs = require("fs");

exports.deleteFile = filePath => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, err => {
      if (err) {
        console.log(err);
        reject(err);
      }
    });
  });
};
