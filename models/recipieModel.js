import mongoose, { mongo } from "mongoose";
import { type } from "os";

const recipeiSchema = mongoose.Schema({
name: {
        type: String,
        required: true,
        trim: true
    },
    ingredients: {
        type: [String], // List of ingredients
        required: true,
        index:true
    },
    instructions: {
        type: String,
        required: true
    },
    cookingTime: {
        type: Number, 
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"], 
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'category',
    },
    allergens: {
        type: [String], 
        default: []
    },
    dietaryPreferences: {
        type: [String], 
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", 
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
   
    ratings: {
        type: [Number], 
        default: []
    },
    avgRating: {
        type: Number,
        default: 0
    },
    approvalStatus: {
        type: String,
         enum: ["none","pending", "approved", "rejected"], 
         default: "none" 
       },
    verified:{
        type:Boolean,
        default:false,
    },
    likeCount:{
        type:Number,
        default:0
    },
    likedBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user" 
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
},{timestamps:true});


export default mongoose.model('recipie',recipeiSchema)
