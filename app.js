const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors')

require('dotenv').config()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use(cors())

//app.use('/images', express.static(path.join(__dirname, 'images')));

console.log("path : " + path + "__dirname : " + __dirname);



//----------------------------------------------pour des tests



const { logUser , signupUser }  = require('./controllers/users');
//  const { getPosts } = require('./controllers/posts');
//  const { checkToken} = require('./middleware/token');
const { postRouter }  =require('./routes/posts');
// app.all("*",logRequest)
//app.get("/" , logRequest , (req,res)=> res.send("hello"))
app.use("/posts", postRouter)
app.post("/auth/login",logUser)
app.post("/signup",signupUser)

//const {imageUpload} = require('./middleware/medias')
app.use("/upload",express.static('upload'));

// const {prisma} = require('./db/db')
// const allUsers = prisma.Users.findMany().then(console.log).catch(console.error);
// const allPosts = prisma.Posts.findMany().then(console.log).catch(console.error);


module.exports = app;