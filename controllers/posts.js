const { prisma } = require("../db/db.js");

async function getPosts(req, res) {
  try {
    const email = req.email;
    
    const user = await prisma.Users.findUnique({ where: { email: email } });
    
    const allPosts = await prisma.Posts.findMany({
      include: {
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                email: true,
                name: true,
                lastName: true,
                avatar: true,
                service: true,
                admin: true,
              },
            },
          },
        },
        
        user: {
          select: {
            email: true,
            name: true,
            lastName: true,
            avatar: true,
            service: true,
            admin: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    allPosts.forEach((post) => {
      var mydate = post.createdAt;
      
      var date = new Date(mydate);
      var dt = date.getDate();
      var month = date.getMonth() + 1;
      var hr = date.getUTCHours();
      var min = date.getMinutes();
      if (dt < 10) {
        dt = "0" + dt;
      }
      if (month < 10) {
        month = "0" + month;
      }
      if (min < 10) {
        min = "0" + min;
      }
      mydate =
      "Posté le: " +
      dt +
      "-" +
      month +
      "-" +
      date.getFullYear() +
      " à " +
      hr +
      "h:" +
      min;
      
      post.createdAt = mydate;
      
      post.comments.forEach((comment) => {
        var commentCreateAt = comment.createdAt;
        
        var date = new Date(commentCreateAt);
        var dt = date.getDate();
        var month = date.getMonth() + 1;
        var hr = date.getUTCHours();
        var min = date.getMinutes();
        if (dt < 10) {
          dt = "0" + dt;
        }
        if (month < 10) {
          month = "0" + month;
        }
        if (min < 10) {
          min = "0" + min;
        }
        comment.createdAt =
        dt + "-" + month + "-" + date.getFullYear() + " à " + hr + "h:" + min;
        
      });
    });
    
    
    res.send({ posts: allPosts, email, user });
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function createPost(req, res) {
  try {
    
    const content = req.body.content;
    const hasImage = req.file != null;
    const url = hasImage ? createImageurl(req) : undefined;
    
    const email = req.email;
    
    const userId = await prisma.Users.findUnique({ where: { email } });
    
    const post = { content, imageUrl: url, userId: userId.id };
    
    const result = await prisma.Posts.create({ data: post });
    
    
    res.send({ post: result });
  } catch (error) {
    res.status(500).send({ error });
  }
}



async function deletePost(req, res) {
  
 
  // Id du post
  const postId = Number(req.params.id);
  
  
  
  const post = await prisma.Posts.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: { email: true },
      },
    },
  });
  

  
  // test existence du post
  if (post == null) return res.status(404).send({ error: "Post not found" });
  
  // test appartenance du post au user
  const email = req.email;
  
  if ( req.body.admin != 'true' && email != post.user.email)
  return res.status(404).send({ error: "Not owner of this post" });
  
  // delete the comments
  const nbCommentDeleted = await prisma.Comments.deleteMany({
    where: { postId: post.id },
  }); 
  
  /// delete the post
  await prisma.Posts.delete({ where: { id: post.id } });
  
  res.send({ message: "Post deleted" });
  
}

function createImageurl(req) {
  
  let pathToImage = req.file.path.replace("\\", "/");
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/${pathToImage}`;
}


async function createComment(req, res) {
  try {
    // id du post
    
    const postId = Number(req.params.id);
    
    // recup du post avec l id
    const post = await prisma.Posts.findUnique({ where: { id: postId } });
    
    
    
    // test existence du post
    if (post == null) return res.status(404).send({ error: "Post not found" });
    
    //  recupération du userId
    const email = req.email;
    
    const userId = await prisma.Users.findUnique({ where: { email } });
    
    //le post existe , ajout du commentaire
    const commentToSend = {
      content: req.body.comment,
      postId: post.id,
      userId: userId.id,
    };
    
    
    const comment = await prisma.Comments.create({ data: commentToSend });
    
    res.send({ comment });
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updatePost(req, res) {

    try {
      const postId = Number(req.params.id);
      const hasImage = req.file != null;
      var url = hasImage ? createImageurl(req) : null;

      console.log(" url :",url)
      
      const contentUpdated = req.body.contentUpdated;

      const deleteImg  = req.body.deleteImg; // 
            
      const post = await prisma.Posts.findUnique({ where: { id: postId } });

      
      if (post == null) {
        return res.status(404).send({ error: "Post not found" });
      }
      else
      {
      
        if( url === null ) // pas d'update d'image 
        {
          url = deleteImg == "true" ? null : post.imageUrl;
        }
     
      }
      
      
      
      const update_Post = await prisma.Posts.update({
        where: {
          id: postId,
        },
        data: {
          content: contentUpdated,
          imageUrl: url,
        },
      });
      res.send({ update_Post: update_Post, message: "post updated" });
    } catch (error) {
      res.status(500).send({ error });
    }
    
    }
    
    module.exports = {
      updatePost,
      getPosts,
      createPost,
      createComment,
      deletePost,
    };
    