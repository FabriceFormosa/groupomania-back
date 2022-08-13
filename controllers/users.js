const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users, prisma } = require("../db/db.js");

/********************************************************************************* */
function createImageurl(req) {
  
  let pathToImage = req.file.path.replace("\\", "/");
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/${pathToImage}`;
}
/************************************************************************************* */
async function updateUser(req, res) {
  try {
    
    const hasImage = req.file != null;
    const urlAvatar = hasImage ? createImageurl(req) : undefined;
    
    const { id, email, password, admin, name, lastName, service } = JSON.parse(
      req.body.user_datas
      );
      
      
      
      const user = await prisma.Users.findUnique({ where: { id: id } });
      
      
      if (user == null) return res.status(404).send({ error: "user not found" });
      
      var hash = user.password; // hash par defaut
      
      
      if (password != null) {
        // demande changement de mot de passe
        // le mot de passe a changer mise à jour à effectuer
        
        try {
          hash = await hashPassword(password);
        } catch (error) {
          console.log("error: ",error)
        }
        
        
      }
      
      const userId = Number(user.id);
      
      // /// update the user
      const updateUser = await prisma.Users.update({
        where: {
          id: userId,
        },
        data: {
          email: email,
          name: name,
          lastName: lastName,
          service: service,
          admin: admin,
          avatar: urlAvatar,
          password: hash,
        },
      });
      
      res.send({ updateUser: updateUser });
    } catch (error) {
      res.status(500).send({ error: "user not updated" });
    }
  }
  /************************************************************************************** */
  async function deleteUser(req, res) {
    
   
    try {
      // test appartenance du post au user
      const email = req.email;
      const isUserAdmin = await prisma.Users.findUnique({
        where: { email: email },
      });
      
      if (isUserAdmin.admin == "false")
      return res
      .status(404)
      .send({ error: "Only Admin is authorized to delete user" });
      
      // id du user à supprimer
     
      const user_Id = Number(req.params.id);
      
      // rechercher les postes liés au user
      const posts = await prisma.Posts.findMany({where: { userId: user_Id }});

      
      if (posts == null) return res.status(404).send({ error: "Post not found" });
      
      for await (const post of posts) {
        // delete the comments
        const nbCommentDeleted = await prisma.Comments.deleteMany({where: { postId: post.id }}); //
  
        
        /// delete the post
        const onePost = await prisma.Posts.delete({where: { id: post.id }});
 
      }
      
      // rechercher les commentaires liés au user
      const comments = await prisma.Comments.deleteMany({where: { userId: user_Id }});
 
      
      
      const userDeleted = await prisma.Users.delete({ where: { id: user_Id } });

      
      res.send({ userDeleted: userDeleted, message: "User deleted" });
    } catch (error) {
      res.status(500).send({ error: "user not deleted" });
    }
    

  }
  
  async function logUser(req, res) {
    try {
  
      const { email, password } = req.body;
      const user = await getUser(email);
      if (user == null) return res.status(404).send({ error: "user not found" });
      
      const isPasswordCorrect = await checkPassword(user, password);
      
      if (!isPasswordCorrect)
      return res.status(401).send({ error: "Wrong password" });
      
      const token = makeToken(email);
      
      // il faut  aussi recuperer tous les emails / url avatar dans la base pour eviter trop de requete
      
   
      
      res.send({ token: token, user: user });
    } catch (error) {
      res.status(500).send({ error });
    }
    
  }
  
  function makeToken(email) {
    
    const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });
    
    return token;
  }
  
  function checkPassword(user, password) {
    
    return bcrypt.compare(password, user.password);
  }
  
  async function getUserByEmail(req, res) {
    const email = req.params.email;
    
    
    const user = await prisma.Users.findUnique({ where: { email: email } });
    if (user == null) {
      res.send({ error: "user not founded " });
    }
    
    res.send({ user, message: "user founded " });
    
  }
  
  // locale
  async function getUser(email) {
    
    const user = await prisma.Users.findUnique({ where: { email: email } });
    
    return user;
    
    
  }
  /************************************************************************************************ */
  async function createUser(req, res) {
    
    
    try {
      const { email, password, admin, name, lastName, service } = JSON.parse(
        req.body.user_datas
        );
        
        
        const hasImage = req.file != null;
        const urlAvatar = hasImage ? createImageurl(req) : undefined;
        
        
        const userDB = await getUser(email);
        
        if (userDB != null)
        return res.status(404).send({ error: "user already exists" });
        
        const hash = await hashPassword(password);
        
        const user = await saveUser({
          email: email,
          password: hash,
          admin: admin,
          name: name,
          lastName: lastName,
          service: service,
          avatar: urlAvatar,
        });
        
        res.send({ user, error: "user created" });
      } catch (error) {
        res.status(500).send({ error });
      }
    }
    //*************************************************************************** */
    async function signUpUser(req, res) {
      
      try {
        const { email, password, confirmPassword, admin, name, lastName, service } =
        JSON.parse(req.body.user_datas);
        
        if (password != confirmPassword)
        return res
        .status(404)
        .send({
          error: "Account not created ! passwords don't match",
          msg: "",
        });
        
        
        const hasImage = req.file != null;
        const urlAvatar = hasImage ? createImageurl(req) : undefined;
        
        
        const userDB = await getUser(email);
        
        
        if (userDB != null)
        return res.status(404).send({ error: "user already exists", msg: "" });
        
        const hash = await hashPassword(password);
        
        
        const user = await saveUser({
          email: email,
          password: hash,
          admin: admin,
          name: name,
          lastName: lastName,
          service: service,
          avatar: urlAvatar,
        });
        
        res.send({ user, msg: "user created", err: "" });
      } catch (error) {
        res.status(500).send({ error });
      }
    }
    
    function saveUser(user) {
      
      return prisma.Users.create({ data: user });
      
    }
    
    function hashPassword(password) {
      return bcrypt.hash(password, 10);
    }
    
    module.exports = {
      logUser,
      signUpUser,
      getUserByEmail,
      createUser,
      deleteUser,
      updateUser,
    };
    