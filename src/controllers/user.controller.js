
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asychandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registeruser = asychandler(async (req, res) => {


    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    console.log(req.body);

    const {username, email, password, fullName} = req.body;
    console.log(username);
    if([username,email,password,fullName].some(field=>field.trim() ==="")){              // validate that all fields are present
        throw new ApiError(400,"All fields are required");
    }

    const userexistance = await User.findOne({
        $or:[{username},{email}]
    })

    if(userexistance){
        throw new ApiError(401,"username or email is already present");
    }

    console.log("files",req.files);
      const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    console.log("avatarLocalPath",avatarLocalPath);
    console.log("coverImageLocalPath",coverImageLocalPath);

     if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({       // create user object
        username,email,password,
        fullName,avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken") // remove password and refresh token from response
    
    if(!createdUser){
        throw new ApiError(500,"User not created")
    }
    res.status(201).json({
        success: true,
        message: "User created successfully",
        createdUser
    })
})

const loginuser = asychandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user exists: username, email
    // check for password
    // compare password with db password
    // generate access token and refresh token
    // set cookies with tokens
    // return res

    const {username, email, password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Username is required");
    }
    if(password.trim() == ""){
        throw new ApiError(400,"Password is required");
    }

    const userExistance = await User.findOne({
        $or:[{username},{email}]
    })
    if(!userExistance){
        throw new ApiError(401,"User does not exist");
    }

    const passwordCheck = userExistance.isPasswordCorrect(password);
    if(!passwordCheck){
        throw new ApiError(401,"Invalid password");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(userExistance._id);
    const loggedInUser = await User.findById(userExistance._id).select("-password -refreshToken") // remove password and refresh token from response


    const options = {
        httpOnly: true,
        secure:true
       
    };
    return res
            .status(200)
            .cookie("accessToken", accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json( new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken}, // we're passing access token and refresh token in response for mobile app
                "User logged in successfully"));
  
})


const logoutuser = asychandler(async(req,res)=>{
    // 1st need to pass the user id in the request
    // in logout need to remove cookies and refresh token from db
   await User.findByIdAndUpdate(
        req.user._id,
    {
        $set:{refreshToken:undefined},
    },
    {
        new:true,  // return the updated user
    },
    
    );
    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asychandler(async(req,res)=>{

    const refreshAccessToken = req.cookies.refreshToken || req.body.refreshToken ;

    if(!refreshAccessToken){
        throw new ApiError(401, "Refresh token is missing or invalid");
    }

   try {
     const decodedRefreshToken = jwt.verify(refreshAccessToken, process.env.REFRESH_TOKEN_SECRECT);
     console.log("Decoded Refresh Token:", decodedRefreshToken);
 
     const user = await User.findById(decodedRefreshToken?._id);
 
      if(!user){
         throw new ApiError(401, "Invalid refresh token or user not found");
     }
     if(refreshAccessToken !== user.refreshToken){
         throw new ApiError(401, "Refresh token does not match");
     }
 
     const {accessToken, newrefreshToken} = await generateAccessAndRefereshTokens(user._id);
 
     const options = {
         httpOnly: true,
         secure:true
     };
 
     return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(new ApiResponse(200, { accessToken, refreshToken: newrefresh},"Access token refreshed successfully"));
 
   } catch (error) {
     console.error("Error refreshing access token:", error);
     throw new ApiError(401, "Refresh token is missing or invalid");
    
   }})

export { registeruser,
        loginuser,
        logoutuser,
        refreshAccessToken
};
// This controller handles user registration.
// This controller handles user login.
