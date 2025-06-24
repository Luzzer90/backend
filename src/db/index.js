import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MongoDB_URI}/${DB_NAME}`);
        // the way to connect to the database is to use the mongoose.connect method
        console.log(`\n MonboDB conneted:${connectionInstance.connection.host} \n`);
    
    
    }catch(error){
        console.error("Error connecting to the databae:",error);
        process.exit(1); // Exit the process with failure
    }

}

export default connectDB;