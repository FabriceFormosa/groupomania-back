const usersRouter = require("express").Router();
const { checkToken } = require("../middleware/token");
const {
  logUser,
  signUpUser,
  createUser,
  deleteUser,
  updateUser,
  getUserByEmail,
} = require("../controllers/users");
const { imageAvatar } = require("../middleware/medias");


usersRouter.post("/login", logUser);
usersRouter.get("/getUser/:email", checkToken, getUserByEmail);
usersRouter.post("/create", checkToken, imageAvatar, createUser); // Uniquement pou l admin

usersRouter.delete("/:id", checkToken, deleteUser);
usersRouter.patch("/", checkToken, imageAvatar, updateUser);
usersRouter.post("/signUp", imageAvatar, signUpUser);
usersRouter.get("/checkToken", checkToken);

module.exports = { usersRouter };
