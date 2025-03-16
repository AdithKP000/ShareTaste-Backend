// import JWT  from "jsonwebtoken";
// import userModel from "../models/userModel.js";




// export const requireSignIn= async(req,res,next)=>{
//     try {
//         const decode=  JWT.verify(req.headers.authorization,process.env.JWT_SECRET);
//         req.user=decode;
//         next();
//     } catch (error) {
//         console.log(error);
//         res.status(401).send({
//             message:'Unable to access without login',
//             error

//         })
//     }
// }

// export const isVerified=async(req,res,next)=>{
//     try {
//         const user=await userModel.findById(req.user._id);
//         if(!user){
//             res.json({success:false, message:"Unable to find the user"},console.log("Unable to find the user"))
//         }

//         if(user.isVerified === false)
//         {
//             console.log("Your account has not been verified please complete your Verification process");
//             return res.json({success:false,message:"Your account has not been verified please complete your Verification process"});
            
//         }else{
//             next();
//         }
//     } catch (error) {
//         console.log("user not Verified",error);
//         res.status(404).send({
//             message:"User not verified",
//             success:false,
//             error
//         })
//     }
// }


// export const isAdmin=async(req,res,next)=>{
//     try {
//         const user=  await userModel.findById(req.user._id);
//         if(user.role==1)
//         {
//             next();
//         }
//         else{
//             res.status(401).send({
//                 success:false,
//                 message:"You are not an admin"
//             })
//         }
        
//     } catch (error) {
//         console.log(error);
//         res.status(402).send({
//             success:false,
//             message:"You are not an admin and can't access this page",
//             error
//         })
//     }
// }








import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { error } from "console";

// Main authentication middleware that checks both cookies and headers
export const requireSignIn = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = JWT.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid authentication token'
                });
            }
    
            // Attach user to request
            req.user = decoded;
            req.body.userId = decoded.id;
            next();
        }
        else
        {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};


export const isLoggedIn= async(req,res,next)=>{
        try {
            const token= req.headers['authorization'].split(" ") [1]

        JWT.verify(token,process.env.JWT_SECRET,(error,decode) =>{ 
            if(error){
                return res.status(500).send({
                    success:false,
                    message:"The user is not logged in "
                })
            }
            else{
                req.body.userId=decode.id
                next()
            }
        })
            
        } catch (error) {
         console.log(error)
         req.status(401).send({
            success:false,
            message:"The Unablr to perform loggin verification "
         })
        }
        
}

// Middleware to check if user is verified
export const isVerified = async (req, res, next) => {
    console.log()
    try {
        
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your account to continue"
            });
        }

        next();
    } catch (error) {
        console.error("Verification check error:", error);
        res.status(500).json({
            success: false,
            message: "Error checking user verification",
            error: error.message
        });
    }
};

// Middleware to check if user is admin



export const isChef = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Chef not found"
            });
        }

        if (user.role !== 2) {
            return res.status(403).json({
                success: false,
                message: "chef access required"
            });
        }

        next();
    } catch (error) {
        console.error("Chef check error:", error);
        res.status(500).json({
            success: false,
            message: "Error checking Chef status",
            error: error.message
        });
    }
};


export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
            console.log(req.user.id)
        if (user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        next();
    } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({
            success: false,
            message: "Error checking admin status",
            error: error.message
        });
    }
};




export const userAuth = async (req, res, next) => {
    try {
      
        if (!req.body || Object.keys(req.body).length === 0) {
            req.body = {}; // Ensure req.body exists
        }

        // Get token from cookies
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }
        // Verify token
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token structure' });
        }
        // Attach user ID to req.body
        req.user = decoded;
        req.body.userId = decoded.id;
        next();
        
    } catch (error) {
        console.error('Auth Error:', error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }
};