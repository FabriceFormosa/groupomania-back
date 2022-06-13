
const postRouter=require("express").Router();
const { checkToken } = require('../middleware/token')
const { getPosts,createPost,createComment,deletePost,updatePost } = require('../controllers/posts')
const { imageUpload } =require('../middleware/medias')

postRouter.use(checkToken)
postRouter.post("/:id",createComment)
postRouter.get("/",getPosts)
postRouter.post("/",imageUpload,createPost)
postRouter.delete("/:id",deletePost)
postRouter.patch("/:id",updatePost)


module.exports = {postRouter}