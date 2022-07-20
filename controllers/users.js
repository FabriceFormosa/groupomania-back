const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const {users,prisma} = require('../db/db.js')

/********************************************************************************* */
function createImageurl(req){
  //console.log("createImageurl ",req.file.path)
  let pathToImage=req.file.path.replace("\\","/")
  const protocol = req.protocol
  const host = req.get("host")
  return `${protocol}://${host}/${pathToImage}`
}
/************************************************************************************* */
async function updateUser(req,res)
{
  try
  {
    
    // const content = req.body.content;
    // console.log("---- updateUser called ----user_datas:-",req.body.user_datas)
    const hasImage=req.file != null
    const urlAvatar = hasImage ? createImageurl(req):undefined
    
    const  {id,email,password,admin,name,lastName,service} = JSON.parse(req.body.user_datas)
    
    // console.log( "password:",password)
    
    const user = await prisma.Users.findUnique({where: {id: id}})
    // console.log("updateUser user: " , user)
    
    if( user == null ) return res.status(404).send({error:"user not found"})
    
    var hash = user.password; // hash par defaut 
    
    // console.log(" password :",password)
    // console.log("updateUser urlAvatar :",urlAvatar)
    
    if( password != null) // demande changement de mot de passe
    {  
      // le mot de passe a changer mise à jour à effectuer
      // console.log("updateUser user password: " , password," :" ,hash)
      try {
        hash = await hashPassword(password)
      } catch (error) {
       // console.log(error)
      }
      
     // console.log("updateUser user password: " , password," :" ,hash)
      
    }
    
    const userId=Number(user.id)
    
    
    // /// update the user
    const updateUser = await prisma.Users.update({
      where: {
        id: userId,
      },
      data: {
        email:email,
        name: name,
        lastName: lastName,
        service: service,
        admin:admin,
        avatar: urlAvatar,
        password:hash
        
      }
    })
    
    res.send({updateUser:updateUser}) 
    
  }
  catch(error)
  {
    res.status(500).send({error:"user not updated"})
  }
  
}
/************************************************************************************** */
async function deleteUser(req,res)
{
  
  try
  {
    // test // test appartenance du post au user
    const  email = req.email
    // console.log("fonction deleteUser req.email: " , req.email)
    
    const isUserAdmin = await prisma.Users.findUnique({where: {email: email}})
    
    if(isUserAdmin.admin == "false")
    return res.status(404).send({error:"Only Admin is authorized to delete user"}) 
    
    // id du user à supprimer
    // console.log("---- deleteUser called -----",req.params.id)    
    const userId = Number(req.params.id)
    
    
    // rechercher les postes liés au user        
    const posts = await prisma.Posts.findMany( 
      {
        where: {userId:userId}
      })
      
     // console.log("deletePost nbre de posts:",posts)
      
      if( posts == null )
      return res.status(404).send({error:"Post not found"})
      
      for await (const post of posts) {
        
        // delete the comments
        const nbCommentDeleted =  await prisma.Comments.deleteMany( {where : {postId:post.id}}) //  
       // console.log("deletePost nbCommentDeleted : ",nbCommentDeleted)
        
        
        /// delete the post
        const nbPost = await prisma.Posts.delete( {where : {id:post.id}}) 
        
        
        
      };
      
      const userDeleted =  await prisma.Users.delete( {where : {id:userId}}) 
      
      res.send({  userDeleted:userDeleted,message:"User deleted"}) 
      
    }
    catch(error)
    {
      res.status(500).send({error:"user not deleted"})
    }
    
  }
  
  // const jwt = require('jsonwebtoken');// 
  //const { ExplainVerbosity } = require('mongodb');
  //const allUsers = prisma.User.findMany().then(console.log).catch(console.error);
  
  
  async function logUser(req,res)
  {
    
    try{
      
      const  {email,password} = req.body
      const user = await getUser(email)
      if( user == null ) return res.status(404).send({error:"user not found"})
      
      const  isPasswordCorrect = await checkPassword(user,password)
      
      if( !isPasswordCorrect )
      return res.status(401).send({error:"Wrong password"})
      
      const token = makeToken(email)
      
      // il faut  aussi recuperer tous les emails / url avatar dans la base pour eviter trop de requete
      const allUsers = await prisma.Users.findMany();
      
      
      // console.log("------------------- allUsers ----------------",allUsers)
      
      res.send({token: token,user:user,users:allUsers})
    }
    catch(error)
    {
      res.status(500).send({error})
    }
    
    
  }
  
  function makeToken(email)
  {
    //console.log("makeToken :",process.env.SECRET_KEY)
    const token = jwt.sign({email:email},process.env.SECRET_KEY,{ expiresIn: '24h' })
    //console.log("cretaion token :",token)
    return token
  }
  
  function checkPassword( user,password )
  {
    // console.log("checkPassword  user.password: ",user.password ," password: ",password)
    return bcrypt.compare(password,user.password)
  }
  
  
  async function getUserByEmail(req,res)
  {
    const email = req.params.email
    // console.log("req.params.email:",email)
    
    
    const user = await prisma.Users.findUnique({where: {email: email}})
    if( user == null)
    {
      res.send({error:'user not founded '})
    }
    
    
    res.send({user,message:'user founded '})
    //return users.find(user => user.email === email)
    
  }
  
  // locale
  async function getUser(email)
  {
    //console.log("clalled function getUser(email)",email)
    const user = await prisma.Users.findUnique({where: {email: email}})
    //console.log("user :",user)
    return user
    
    //return users.find(user => user.email === email)
    
  }
  /************************************************************************************************ */
  async function createUser(req,res)
  {
    //console.log("---- createUser called -----",req.body)
    
    try{
      
      const  {email,password,admin,name,lastName,service} = JSON.parse(req.body.user_datas)
      
      //console.log("---- createUser called ----user_datas:-",req.body.user_datas)
      const hasImage=req.file != null
      const urlAvatar = hasImage ? createImageurl(req):undefined
      
      
      // if(password!=confirmPassword) return res.status(404).send({error: "password doesn't match"})
      
      const userDB = await getUser(email)
      //console.log("userDB :",userDB)
      
      if ( userDB != null) return res.status(404).send({error:"user already exists"})
      
      
      const hash = await hashPassword(password)
      //console.log("hash :",hash)
      //console.log("urlAvatar :",urlAvatar)
      
      
      const user = await saveUser({email: email, password: hash,admin:admin,name:name,lastName:lastName,service:service,avatar:urlAvatar })
      //const user = await saveUser({email: email, password: hash,admin:admin})
      //console.log("---- signupUser called -----saveUser done ",user);
      res.send({user,error:'user created'})
    }
    catch(error)
    {
      res.status(500).send({error})
    }
  }
  //*************************************************************************** */
  async function signUpUser(req,res)
  {
   // console.log("---- signupUser called -----",req.body)
    
    try{
      
      const  {email,password,confirmPassword,admin,name,lastName,service} = JSON.parse(req.body.user_datas)
      
      if(password!=confirmPassword) return res.status(404).send({error: "Account not created ! passwords don't match",msg:""})
      
      //console.log("---- createUser called ----user_datas:-",req.body.user_datas)
      const hasImage=req.file != null
      const urlAvatar = hasImage ? createImageurl(req):undefined
      
      
      // if(password!=confirmPassword) return res.status(404).send({error: "password doesn't match"})
      
      const userDB = await getUser(email)
      //console.log("userDB :",userDB)
      
      if ( userDB != null) return res.status(404).send({error:"user already exists",msg:""})
      
      
      const hash = await hashPassword(password)
      //console.log("hash :",hash)
      //console.log("urlAvatar :",urlAvatar)
      
      
      const user = await saveUser({email: email, password: hash,admin:admin,name:name,lastName:lastName,service:service,avatar:urlAvatar })
      //const user = await saveUser({email: email, password: hash,admin:admin})
      //console.log("---- signupUser called -----saveUser done ",user);
      res.send({user,msg:'user created',err:""})
    }
    catch(error)
    {
      res.status(500).send({error})
    }
    
  }
  
  function  saveUser(user) {  
    //console.log("save user :" ,user)
    //users.push({user}) 
    return prisma.Users.create({data:user})
    
    //const allUsers = prisma.user.findMany().then(console.log).catch(console.error);
  }
  
  function hashPassword(password) {
    return bcrypt.hash(password,10)
  }
  
  module.exports = { logUser ,signUpUser,getUserByEmail,createUser,deleteUser,updateUser}