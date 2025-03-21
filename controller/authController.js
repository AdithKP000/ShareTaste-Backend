import hashPassword, { comparePassword } from "../helpers/authHelpers.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import dotenv from "dotenv";
import { Console, error } from "console";
import recipieModel from "../models/recipieModel.js";

dotenv.config()

const genrateOtp=()=>{
    return Math.floor(1000+Math.random()*9000).toString()
}



// User Registration Controller
export const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const otp=genrateOtp();
    

        // Validate required fields
        if (!name) return res.status(400).send({ message: "Name is required" });
        if (!email) return res.status(400).send({ message: "Email is required" });
        if (!password) return res.status(400).send({ message: "Password is required" });



        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).send({
                success: false,
                message: "User already exists, please log in",
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            otp
            
        }); 

        // Save user to database
            await user.save()

        res.status(201).send({
            success: true,
            message: "User created successfully",
            user,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "An error occurred during registration",
            error
        });
    }
};


//sending verification OTP 
export const sendOTP=async(req,res)=>{
    try {
        
            const {userId}=req.body;
            console.log(userId);

            const user= await userModel.findById(userId);
             user.otp=genrateOtp();
            if(user.isVerified)
            {
                return res.status(404).send({
                    success:false,
                    message:"User is already verified"
                })
            }
            else{
                user.otpExpires=Date.now()+ 5*60 * 1000;
                await user.save()

                const mailOptions={
                    from:process.env.SENDER_EMAIL,
                    to:user.email,
                    subject:"OTP verification required ",
                    html:`<h1> Your OTP is ${user.otp}</h1>`
                }
    
                    await transporter.sendMail(mailOptions);
                    res.json({
                    success:true,
                    message:"Verification OTP send"
                    })    
            }
    } catch (error) {
        console.log(error);
        res.send({
            success:false,
            message:"Error occurred while sending OTP",
            error
        })
    }
}
//verify user
export const verifyUser= async (req,res)=>{
    try { 
        const{userId,otp}=req.body
        console.log(userId)
            if(!userId || !otp)
            {
                return res.json({
                    success:false,
                    message:"Missing credentials"
                })
            }
            try {
                const user= await userModel.findById(userId);

                console.log(user.otp);


                if(!user)
                {return res.json({success:false, message:error.message})}

                if(user.otp=== '' || user.otp!=otp)
                {return res.json({success:false,message:"OTP is not matching" })}

                if(user.otpExpires<Date.now())
                {return res.json({success:false,message:"OTP has been expired" })}

                    user.isVerified=true;
                    user.otpExpires=new Date(0);
                    user.otp='';

                    await user.save();
                    return res.json({success:true,message:"User has been succesfully verified"});
                
            } catch (error) {
                res.json({
                    success:false,
                    message:"Error occurred while verifying user",
                    error
                })
            }

    } catch (error) {
        console.log(error)

        res.status(400).send({
            success:false,
            message:'Unable to verify user try another time',
            error
        })
    }
}

// User Login Controller
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not registered",
            });
        }

        // Validate password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate JWT
        const token = JWT.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
      
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
                alergies:user.alergies,
                dietaryPreferences:user.dietaryPreferences,
                isVerified:user.isVerified,
                image:user.image,
                approvalStatus:user.approvalStatus,
                licenseNumber:user.licenseNumber,
                verified:user.verified,
                description:user.description,
                
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// Protected Test Route
export const testController = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Protected route accessed successfully",
        });
    } catch (error) {
        console.error("Protected route error:", error);
        res.status(401).json({
            success: false,
            message: "Access denied without token",
        });
    }
};



export const profileController=async(req,res)=>{
try {
    // const user=a
} catch (error) {
    
    console.log("Unablt to fetch the profile of the user",error);
    res.status(403).send({
        success:false,
        message:"Unable to fetch the profile of the user",
        error
    });
}
}





export const resetPassword= async (req,res)=>{
    try {
        const {email}=req.body;
        if(!email){
            return res.status(400).json({success:false,message:"Email is required or email cannot be fetched"})
        }

        const user= await userModel.findOne({email});
        if (!user) {
            console.log("Unable to find the user with the given email")
            return res.status(404).send({
                success: false,
                message:'Unable to find user with the given mail'
                
            })
        }
        user.resetPassword=genrateOtp();
        user.resetPasswordOtpExpires=Date.now()+ 15 * 60 * 1000;

        await user.save();
        
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:"Password reset OTP ",
            html:`<h1> <b>  You have requested to reset your password please provide this otp:  ${user.resetPassword} to change the password </b>  </h1>`
        }

            await transporter.sendMail(mailOptions);
            res.json({
            success:true,
            message:"Password reset  OTP send"
            })  
        
    } catch (error) {
        console.log(error);
        res.status(404).send({
            success:false,
            message:"Can not send password reset OTP"
        })
    }
}



export const resetUserPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Validate input fields
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "Email, OTP, and new password are required" 
        });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Unable to find user with the given email"
            });
        }

        // Check OTP match
        if (!user.resetPassword || user.resetPassword !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP mismatch" 
            });
        }

        // Check if OTP is expired
        if (user.resetPasswordOtpExpires && new Date(user.resetPasswordOtpExpires).getTime() < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP has expired" 
            });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user password and reset OTP fields
        user.password = hashedPassword;
        user.resetPassword = ''; // Clear OTP
        user.resetPasswordOtpExpires = null; // Clear expiry

        await user.save();

        return res.status(200).json({ 
            success: true, 
            message: "Password reset successfully" 
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while resetting password",
            error: error.message
        });
    }
};

// find single user
export const findOneController=async(req,res)=>{
    try {
        const {email}=req.body;
        if(!email){
            return res.status(400).json({success:false,message:"Unable to obtain email"})
        }
            const user=await userModel.findOne({email});

                if(!user)
                {
                    res.json("Unable to find the user with the given credentials")
                    console.log("Unable to find user");
                }
            

                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        address: user.address,
                        role: user.role,
                        alergies:user.alergies,
                        dietaryPreferences:user.dietaryPreferences,
                        isVerified:user.isVerified,
                        description:user.description,
                    },
                });
            
    } catch (error) {
        console.log("Unable to find one by the given Details",error);
        res.status(400).send({
            success:false,
            message:"Unable to find the user with the given details",
            error
        })
    }
}


export const getSingleUserController= async(req,res)=>{
    try {
        const {userId}= req.params;
        if(!userId)
        {
            console.log("userId Is not recieved");
            res.status(400).send({
                success:false,
                message:"Unable to get userID"
            })
        }

        
            const user= await userModel.findById(userId);
            if(!user)
            {
                console.log("Unable to find the user")
                res.status(400).send({
                    success:false,
                message:"Unable to get user"
                })
            }

            res.status(200).send({
                success:true,
                message:"Succesfully obtaiend user",
                user,
            })

        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Unable to find the details of the specific user",
            error,
        })
    }
}




export const updateUserController = async (req, res) => {
    try {
      const { name, address, alergies, dietaryPreferences , description} = req.body;
      const userId = req.params.id; // Correcting the parameter name
  
      let user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
  
      // Updating fields only if they are provided
      user.name = name || user.name;
      user.address = address || user.address;
      user.alergies = alergies || user.alergies;
      user.dietaryPreferences = dietaryPreferences || user.dietaryPreferences;
      user.description=description||user.description
      await user.save(); // Save the updated user
  
      res.status(200).send({
        success: true,
        message: "Profile updated successfully",
        user, // Corrected from updatedUser
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Unable to update the profile of the user",
        error: error.message,
      });
    }
  };
  





 

// Fix the get image controller
export const uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
  
      
      const { userId } = req.body; // Ensure userId is extracted correctly
        console.log(userId);

      if(!userId){
        console.log("unablr to find userD")
        return res.status(404).json({
            success: false,
            message: 'UserID not found'
          });
      }
  
      const user = await userModel.findById(userId);
        if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      // Update user with image
      user.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image',
        error: error.message
      });
    }
  };
  
  
  export const getImage = async (req, res) => {
    try {
        const { userId } = req.body; // Extract userId properly


        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await userModel.findById(userId);
  
      if (!user || !user.image || !user.image.data) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
  
      res.set('Content-Type', user.image.contentType);
      res.send(user.image.data);
    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving image',
        error: error.message
      });
    }
  };
            export const getBannerImg= async(req,res)=>{
                try {
                    const { userId } = req.params;
            
                    if (!userId) {
                        return res.status(400).json({
                            success: false,
                            message: 'User ID is required'
                        });
                    }
            
                    const user = await userModel.findById(userId);
            
                    if (!user || !user.bannerImage || !user.bannerImage.data) {
                        return res.status(404).json({
                          success: false,
                          message: 'Image not found'
                        });
                      }
            
                      res.set('Content-Type', user.bannerImage.contentType);
                      res.send(user.bannerImage.data);
            
                } catch (error) {
                    console.log(error);
                    res.status(500).send({
                        success:false,
                        message:"Unable to fetch the user Image",
                        error,
                    })
                }
            }



    export const getUploadForm= (req, res) => {
      res.send(`
        <form action="/api/upload" method="post" enctype="multipart/form-data">
          <input type="text" name="username" placeholder="Username">
          <input type="file" name="image" accept="image/*">
          <button type="submit">Upload</button>
        </form>
      `);
    }




    export const getAllUserController = async(req,res)=>{
        try {
                const users= await userModel.find()
                // .select("-image,-otp,otpExpires,resertPassword,resetPasswordOtpExpires")
            
                if(!users){
                    console.log("Unable to fetch all")
                }
                res.status(200).send({
                    success:true,
                    message:"Succesfully Found  ALL users ! ",
                    users,
                })

        } catch (error) {
            console.log("Unablr to fetch the details of all users Server side error "+error);
            res.status(500).json({
                success:false,
                message:"Server side error while fetching the details of all users",
                error:error.message
            });
        }
    }




// cHEF ROUTES

export const getAllChefController = async(req,res)=>{
    try {
        const chefs= await userModel.find({approvalStatus:'approved'})
        .select("-image  -otp -otpExpires -resertPassword -resetPasswordOtpExpires -address -description -alergies  -dietaryPreferences -savedRecipies -bannerImage  ")

        if(!chefs)
        {
            console.log("Unable to find chefs");
            res.status(400).send({
                success:false,
                message:'unable to get Chefs'
            })
        }
        res.status(200).send({
            success:true,
            message:'Succefully FOunf all chefs',
            chefs,
        })

        
    } catch (error) {
        console.log(error),
        res.status(500).send({
            success:false,
             message:"Unable to find chefs",
             error:error.message
        })
    }
}

export const getChefImgController = async(req,res)=>{
    try {
        const {chefId} = req.params;    
        if (!chefId) {
            return res.status(400).json({
                success: false,
                message: 'chef ID is required'
            });

        }   
        const chef= await userModel.findById(chefId)        
        .select("-otp -otpExpires -resertPassword -resetPasswordOtpExpires -address -description -alergies  -dietaryPreferences -savedRecipies -bannerImage -email  -password    ")

        if (!chef || !chef.image || !chef.image.data) {
            return res.status(404).json({
              success: false,
              message: 'Image not found'
            });
          }
          res.set('Content-Type', chef.image.contentType);
          res.send(chef.image.data);

    } catch (error) {
        console.log(error);
    }
}

    // for a user to be regitered as a Chef
export const createChefController = async(req,res)=>{
    try {
        
        const {userId,licenseNumber}=req.body;
         
        if(!licenseNumber || !userId)
        {
            console.log("License number  or userID is required");
        }

        const user =await userModel.findById(userId)

        if(!user){
            console.log("User not found");
        }
        else{
            user.chefLicense.licenseNumber=licenseNumber
            user.approvalStatus="pending"
            await user.save()
            res.status(200).send({
                success:true,
                message:"Approval Request send",

            })
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Unablr to create a new Chef ",
            error,
        })
    }
}




//uploading User's Chef License Certificate
export const uploadDocumentController = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
  
      
      const { userId } = req.body; // Ensure userId is extracted correctly
        console.log(userId);

      if(!userId){
        console.log("unablr to find userD")
        return res.status(404).json({
            success: false,
            message: 'UserID not found'
          });
      }
      
  
      const user = await userModel.findById(userId);
        if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      // Update user with image
      user.chefLicense.document = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image',
        error: error.message
      });
    }
  };
  
  

  //used to get documnet of chef license from users     mainly used for admins
    export const GetDocumentController = async (req, res) => {
        try {
            const { userId } = req.params; // Extracted userId from REq.params


            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }
    
            const user = await userModel.findById(userId);
      
          if (!user || !user.image || !user.chefLicense.document.data) {
            return res.status(404).json({
              success: false,
              message: 'Image not found'
            });
          }
      
          res.set('Content-Type', user.chefLicense.document.contentType);
          res.send( user.chefLicense.document.data);
        } catch (error) {
          console.error('Get image error:', error);
          res.status(500).json({
            success: false,
            message: 'Error retrieving image',
            error: error.message
          });
        }
      };












      //admin Routes

export const pendingApprovalsController = async (req, res) => {
    try {
        const users = await userModel.find({ approvalStatus: "pending" });

        if (!users || users.length === 0) {
            console.log("No pending approval requests found.");
            return res.status(404).send({
                success: false,
                message: "No pending approvals found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Successfully obtained the user requests",
            users,  // Changed from `user` to `users`
        });

    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        res.status(500).send({
            success: false,  // Set success to false on error
            message: "Unable to get the pending approvals list due to a server error",
            error,
        });
    }
};



export const  approveChefController = async(req,res)=>{
    try {
        const {userId}= req.params;
        const user = await userModel.findByIdAndUpdate(userId, { approvalStatus: "approved" ,verified:true}, { new: true } );
            if(!user)
            {
                console.log("Unablr to update user");
                return res.status(404).send({
                    success: false,
                    message: "User not found",
                });
            }
            else{
            res.status(200).send({
                success:true,
                message:"Succesfully Approved the chef",
                user,
            });


        }


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Unable to approve Request",
            error,
        })
    }
}





export const saveRecipieController= async(req,res)=>{
    try {
        const {userId}= req.params;
        const {recipieId} = req.body;
        console.log(recipieId,userId);
        if(!userId )
            {
                console.log("Unable to obtain userID")
                res.status(400).send({message:"Unable to obtain userId"})
            }  
        if(!recipieId )
            {
                
                res.status(400).send({message:"Unable to obtain recipieId"})
            }   

        const user= await userModel.findByIdAndUpdate(userId,{$addToSet:{ savedRecipies : recipieId}}, {new:true})

        if(!user)
        {
            console.log("Unable to set saved recipie");
            res.status(400).send({
                success:false,
                message:"Unable to Update the saved recipied  to the DB",
            })
        };

        res.status(200).send({ 
            success:true,
            message:"Succesfully added to saved Recipie",
            user,
        })

                  
    } catch (error) {
        console.error("Error saving recipe:", error);
        res.status(500).send({
            success:false,
            message:"unable to save recipie ", 
            error,
        })
    }
}


export const removeSavedRecipieController= async(req,res)=>{
    try {
        const {userId}= req.params;
        const {recipieId} = req.body;
        console.log(recipieId,userId);
        if(!userId )
            {
                console.log("Unable to obtain userID")
                res.status(400).send({message:"Unable to obtain userId"})
            }  
        if(!recipieId )
            {
                
                res.status(400).send({message:"Unable to obtain recipieId"})
            }   

            const user= await userModel.findByIdAndUpdate(userId,{$pull:{ savedRecipies : recipieId}}, {new:true});

        if(!user)
        {
            console.log("Unable to remove saved recipie");
            res.status(400).send({
                success:false,
                message:"Unable to remove saved recipie from DB"
            })
        }
        res.status(200).send({
            success:true,
            message:"Succesfully removed from saved Recipie",
            user,
        })
        
    } catch (error) {
        console.log("Unable to remove from saved recipie");
        res.status(500).send({
            success:false,
            message:"Unable to remove from saved recipies",
            error,
        })
    }
}

export const getSavedRecipeController = async (req, res) => {
    try {
        const { recipeIds } = req.body;

        // Validate input
        if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Invalid or empty recipe ID list",
            });
        }

        // Fetch recipes from the database
        const recipes = await recipieModel.find({ _id: { $in: recipeIds } });

        if (!recipes || recipes.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No saved recipes found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Found saved recipes",
            recipes,
        });

    } catch (error) {
        console.error("Error fetching saved recipes:", error);
        res.status(500).send({
            success: false,
            message: "Unable to get saved recipes",
            error: error.message,
        });
    }
};

