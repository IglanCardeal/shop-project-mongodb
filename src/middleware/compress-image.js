const fs = require('fs');
const sharp = require('sharp');

exports.compressImage = (file, size) => {
  const newPath = file.path.split('.')[0] + '.webp'; // novo formato.

  return sharp(file.path)
    .resize(400, 400)
    .toFormat('webp')
    .webp({
      quality: 80
    })
    .toBuffer()
    .then(data => {
      fs.access(file.path, (err) => {
        if (!err) {
          fs.unlink(file.path, err => {
            if (err) console.log(err);
          });
        }
      });

      fs.writeFile(newPath, data, (err) => {
        if (err) {
          throw err;
        }
      });

      return newPath;
    });
};