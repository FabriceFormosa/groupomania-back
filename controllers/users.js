const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const {users} = require('../db/db.js')


function logUser(req,res)
{
  const  {email,password} = req. body
  const user = getUser(email)
  if( user == null ) return res.status(404).send({error:"user not found"})

  checkPassword(user,password)
  .then( (isPasswordCorrect) =>{
    if( !isPasswordCorrect )return res.status(401).send({error:"Wrong password"})
  const token = makeToken(email)
 //res.send({token: token,email:user.email})
 res.send({token: token})
  })
  .catch( (error) => res.status(500).send({error}))
}

function makeToken(email)
{
  console.log("makeToken :",process.env.SECRET_KEY)
  const token = jwt.sign({email:email},process.env.SECRET_KEY,{ expiresIn: '24h' })
  console.log("cretaion token :",token)
  return token
}

function checkPassword( user,password )
{
   //console.log("checkPassword  user.password: ",user.password ," password: ",password)
    return bcrypt.compare(password,user.password)
}

function getUser(email)
{
    return users.find(user => user.email === email)
}

function signupUser(req,res)
{
  const  {email,password,confirmPassword} = req. body
  if(password!=confirmPassword) return res.status(404).send({error: "password doesn't match"})
  const user = getUser(email)
  if ( user != null) return res.status(404).send({error:"user already exists"})
  hashPassword(password)
  .then((hash) =>{
    saveUser({email: email, password: hash})
    res.send({email: email, password: hash})
  }
   )
   .catch( (error) => res.status(500).send({error}))
  
}

function  saveUser(user) {  
  users.push({email,password}) 
}

function hashPassword(password) {
  return bcrypt.hash(password,10)
}

module.exports = { logUser ,signupUser }