import mongoose from "mongoose";
import path from "path";
import validator from "validator"
import fs from "fs"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load default images
const defaultImagePath = path.join(__dirname, "defaults", "default-profile.jpg");
const defaultBannerPath = path.join(__dirname, "defaults", "default-banner.jpg");

const defaultImage = fs.existsSync(defaultImagePath)
    ? fs.readFileSync(defaultImagePath)
    : null;

const defaultBannerImage = fs.existsSync(defaultBannerPath)
    ? fs.readFileSync(defaultBannerPath)
    : null;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, 
        unique: true,  
        trim: true,      // Removes whitespace around the name  Adith KPO
        minlength: 3,   
        maxlength: 50,   
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],  // Validates email format

       validate(value){
        if(!validator.isEmail(value)){ throw new Error ("Enter a Valid Email")}
       }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,  // Minimum length for a password
        trim:true,
        unique:true,
        validate(value){
            if(value.toLowerCase().includes("password")){
                 throw new Error("Password Cannot be password")
            }
        }
        
    },
  
    address:{
        type: String,
        
    },
    description:{
        type:String,
        trim: true,
        maxlength: 500, //max length of the descriprion of the
     
    },
    alergies:{
        type:[String],
        default:["None"],

    },
    dietaryPreferences: {
        type: [String],  
        default: []
    },
    role:{
        type:Number,
        default:0,
    },
    otp:{
        type:String,
        default:null
    },isVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date,
        default:null
    },resetPassword:{
        type:String,
        default:null
    },
    resetPasswordOtpExpires:{
        type:Date,
        default:null
    },
    
    savedRecipies:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"recipieModel",
    }],
    image: {
        data: Buffer,
        contentType: String,
      },
      bannerImage: {
        data: Buffer,
        contentType: String,
      },
      approvalStatus: {
         type: String,
          enum: ["none","pending", "approved", "rejected"], 
          default: "none" 
        },
    chefLicense: {
        licenseNumber: { type: String,default:'0000000', unique: true, sparse: true }, // Unique for chefs
        document: {  data: Buffer,contentType: String},
        verified: {type: Boolean, default: false }
    },
      

},{timestamps:true})

userSchema.pre("save", function (next) {
    if (!this.image.data) {
        this.image = { data: defaultImage, contentType: "image/jpeg" };
    }
    if (!this.bannerImage.data) {
        this.bannerImage = { data: defaultBannerImage, contentType: "image/jpeg" };
    }
    next();
});

export default mongoose.model('user',userSchema)