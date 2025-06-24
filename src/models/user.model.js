import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const UserSchema = new mongoose.Schema({
    username:{type:String, required:true,lowercase:true, unique:true,trim:true,index:true},
    email:{type:String, required:true,lowercase:true, unique:true,trim:true},
    password:{type:String, required:[true,"password is must"],trim:true},
    fullName:{type:String, required:true,trim:true},
    avatar:{type:String,required:true},
    coverImage:{type:String},
    refreshToken:{type:String},
    watchHistory:[{type:mongoose.Schema.Types.ObjectId, ref:"video"}]
},{timestamps:true})

UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        id:this._id,
        username:this.username,
        email:this.email
    },process.env.ACCESS_TOKEN_SECRECT,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIERS_IN});  
    // generating access token with 1 day expiration
    }

UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id:this._id,
    },process.env.REFRESH_TOKEN_SECRECT,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIERS_IN});  
    // returning the refresh token with 30 days expiration
    }
export const User = mongoose.model("user",UserSchema)