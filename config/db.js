import mongoose from "mongoose";
import colors  from 'colors';


const connnectDB=async ()=>{
    try {
        const conn = await mongoose.connect(process.env.connectionUrl);
        console.log(`Connected to the database at ${conn.connection.host}`.bgBlue.white)
    } catch (error) {
        console.log("Error Connecting to the server");
        console.log(error)
        
    }
}

export default connnectDB;