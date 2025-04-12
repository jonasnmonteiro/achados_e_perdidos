const multer = require('multer');
const path = require('path');

// Configura o destino e nome do arquivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads')); // pasta de destino
  },
  filename: function (req, file, cb) {
    // Define nome único: timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });
module.exports = upload;
