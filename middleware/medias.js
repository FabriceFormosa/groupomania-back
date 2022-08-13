const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "upload");
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    let name = file.originalname.split(" ").join("_");
    
    name = name.split("." + extension)[0];
    
    callback(null, name + "_" + Date.now() + "." + extension);
  },
});

const upload = multer({ storage: storage, dest: "upload/" });
const imageUpload = upload.single("image");

/***************************************** */
const storage_avatar = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "avatar");
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    let name = file.originalname.split(" ").join("_");
    name = name.split("." + extension)[0];
    callback(null, name + "_" + Date.now() + "." + extension);
  },
});

const avatar = multer({ storage: storage_avatar, dest: "avatar/" });
const imageAvatar = avatar.single("image");

module.exports = { imageUpload, imageAvatar };
