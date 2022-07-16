const jwt = require('jsonwebtoken');

function checkToken(req, res, next) {
    //console.log( "req.headers.autorization " , req.headers.autorization)
   //const token =req.headers.autorization.split(" ")[1];
   token = req.headers.authorization.split(" ")[1]
   // console.log( "fonction checkToken ", token)
   if( token == null) return res.status(401).send({error:"Missing Token"})

   jwt.verify(token,process.env.SECRET_KEY,(error,decoded) => {
       if(error) return res.status(401).send({error:"Invalid Token"})
       req.email = decoded.email
       // console.log("decoded.email :",decoded.email)
       next()
   })

}



module.exports ={checkToken}