import mongoose, { Schema } from "mongoose"

const categorySchema= new Schema({

    name:{
        type: String,
        required: true,
        trim: true
    },
    slug:{
        type:String,
        required:true
    }

},{timestamps:true});

export default mongoose.model('category',categorySchema)