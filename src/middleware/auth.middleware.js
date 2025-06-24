import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asychandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJWT = asychandler(async (req, res, next) => {

   try {
    const accessToken=  req.cookies.accessToken || req.headers('authorization')?.replace('Bearer ', '');
 
    if(!accessToken) {
        throw new ApiError(401, "Access token is missing or invalid");
    }
 
    const decodedAccesToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRECT);
    // while generating access token we have added id
    // so we can use that id to find the user in the database
    const user = await User.findOne(decodedAccesToken?._id).select("-password -refreshToken"); // exclude password and refreshToken from the user object
 
     if(!user) {
          throw new ApiError(401, "User not found or access token is invalid");
     }
     req.user = user; // attach user to the request object
     // as it's a middleware we can acces this user in the next middleware or route handler
     // so we can use this user object in the next middleware or route handler
     next();
   } catch (error) {
    console.error("Error verifying JWT:", error);
     throw new ApiError(401, "Access token is missing or invalid");
    
   }
});

