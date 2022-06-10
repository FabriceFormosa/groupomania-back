const usersRouter=require("express").Router();
const { checkToken } = require('../middleware/token')
const { logUser , signupUser,createUser,deleteUser,updateUser,getUserByEmail }   = require('../controllers/users');
const { imageAvatar } =require('../middleware/medias')

//usersRouter.use(checkToken)
usersRouter.post("/login",logUser)
usersRouter.get("/getUser/:email",checkToken,getUserByEmail)
usersRouter.post("/create",checkToken,createUser)
usersRouter.post("/delete",checkToken,deleteUser)
usersRouter.post("/update",checkToken,imageAvatar,updateUser)
usersRouter.post("/signup",signupUser)

module.exports = {usersRouter}