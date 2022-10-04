const jwt = require("jsonwebtoken");
require('dotenv').config();

verifyToken = async (data) => {

 
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
		return jwt.verify(data, jwtSecretKey, async (err, payload) => {
			if (err) {
                console.log(err)
				return "error";
              
			} else {
				
                return {data:payload};
			}
		});
	//}
	// return  Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST,
    //     err.stack
    //   );
    //return "error";
};

generateToken = async (data) => {
	try{
console.log(typeof data)
	let jwtSecretKey = process.env.JWT_SECRET_KEY;
	

	const token = jwt.sign(data.toJSON(), jwtSecretKey, {
        expiresIn: 604800 // 1 week
      });
   // req.token = token;
    console.log(token)
    //next();
    return token;
    }
    catch(err){
        console.log(err)
    }
};

module.exports = {verifyToken,generateToken};
