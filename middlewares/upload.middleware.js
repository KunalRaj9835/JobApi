const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword" // .doc (optional)
    ];
    
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF and DOCX files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;