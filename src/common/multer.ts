import multer from "multer";

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp)/.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Invalid image type'));
  },
});

export default upload;