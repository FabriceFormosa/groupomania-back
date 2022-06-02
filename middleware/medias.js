const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'upload');
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    let name = file.originalname.split(' ').join('_');
    
    name = name.split("."+ extension)[0]
    console.log( "name",name)

    console.log( "file",file)
    
    console.log("extension ",extension)
    callback(null, name + '_' + Date.now() + '.' + extension);
  }
});


const upload = multer({storage: storage,dest:"upload/"})
const imageUpload = upload.single('image')
//module.exports = multer({storage: storage}).single('image');



module.exports ={imageUpload}