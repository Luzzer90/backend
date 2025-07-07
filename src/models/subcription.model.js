import mongoose from "mongoose";

const subcriptionSchema = new mongoose.Schema({
    subcriber:{type:mongoose.Schema.Types.ObjectId, ref:"User"},   // one who is subscribing
    channel:{type:mongoose.Schema.Types.ObjectId, ref:"User"},     // channel being subscribed to

},{timestamps:true});

export const Subcription = mongoose.model("subcription",subcriptionSchema);