import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    videoFile:{type:String,required:true},
    title:{type:String,required:true,trim:true},
    description:{type:String,required:true,trim:true},
    thumbnail:{type:String,required:true},
    views:{type:Number,default:0},
    time:{type:String,required:true},
    owner:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    isPublished:{type:Boolean,default:false}
},{timestamps:ture})

videoSchema.plugin('mongooseAggregationPaginate');

export const video = mongoose.model("video",videoSchema);