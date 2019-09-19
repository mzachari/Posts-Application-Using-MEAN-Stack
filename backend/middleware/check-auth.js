const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, 'secret_this_should_be_longer');
  req.userData = {userId: decodedToken.userId, email: decodedToken.email};
  next();
  }
  catch (err) {
    console.log("req1");
    res.status(401).json({
      message: "Auth Failed!"
    });
  }
}
