const jwt = require("jsonwebtoken");

function checkToken(req, res, next) {
  
  token = req.headers.authorization.split(" ")[1];
  
  if (token == null) return res.status(401).send({ error: "Missing Token" });
  
  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if (error) return res.status(401).send({ error: "Invalid Token" });
    req.email = decoded.email;
    
    next();
  });
}

module.exports = { checkToken };
