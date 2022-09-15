const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
      );
      next();
    });
    
    
    app.use(bodyParser.json());
    app.use(cors());
     
    
    
    const { postRouter } = require("./routes/posts");
    app.use("/posts", postRouter);
    
    const { usersRouter } = require("./routes/users");
    app.use("/users", usersRouter);
    
    app.use("/upload", express.static("upload"));
    
    app.use("/avatar", express.static("avatar"));

    app.all('/', (req, res) => {
      console.log("Just got a request!")
      res.send('Yo!')
  })
    
    module.exports = app;
    