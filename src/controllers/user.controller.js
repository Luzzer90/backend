
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asychandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generatereFreshandAccessTokens = async(userId)=>{

   try {
    const user = await User.findById(userId);;
     const accessToken = await user.generateAccessToken();
     const refreshToken = await user.generateRefreshToken();
        // set the refresh token in the user document
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});    // save the user with the new refresh token
        // false because we don't want to validate the password again as we're not changing it


        return ({accessToken,refreshToken})
   } catch (error) {
    throw new ApiError(500, "somthing went wrong while generating tokens");
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

    console.log( "files",req.files);
      const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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

    if(username.trim() == "" || email.trim() ==""){
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

    const {accessToken,refreshToken}=await generatereFreshandAccessTokens(userExistance._id);
    const loggedInUser = await User.findById(userExistance._id).select("-password -refreshToken") // remove password and refresh token from response


    const options = {
        httpOnly: true,
        secure:true
       
    };
    return res.status(200).
            cookie.set("accessToken", accessToken,options).
            cookie.set("refreshToken",refreshToken,options).
            json( new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken}, // we're passing access token and refresh token in response for mobile app
                "User logged in successfully"));
  
})


const logoutuser = asychandler(async(req,res)=>{
    // 1st need to pass the user id in the request
    // in logout need to remove cookies and refresh token from db
    
})

export { registeruser,
        loginuser,
        logoutuser
};
// This controller handles user registration.
// This controller handles user login.
