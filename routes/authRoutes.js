import express from 'express';
import { 
    findOneController, loginController, profileController, registerController, resetPassword, resetUserPassword, sendOTP,
     testController, verifyUser, uploadImage, getImage, getUploadForm, updateUserController, getAllUserController, createChefController,
      uploadDocumentController, GetDocumentController, 
      pendingApprovalsController,
      approveChefController,
      saveRecipieController,
      removeSavedRecipieController,
      getAllChefController,
      getSavedRecipeController
    
    } from '../controller/authController.js';

import { isAdmin, isLoggedIn, isVerified, requireSignIn, userAuth ,} from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';



const router=express.Router()


router.post('/register',registerController,)

router.post('/login',loginController)

//update user details
router.put('/updateUser/:id',userAuth,updateUserController)

//verification
router.post('/send-verify-otp',userAuth,sendOTP)  //to send reset otp
router.post('/verify-otp',userAuth,verifyUser)  //to verify the send OTP
router.post('/reset-password',resetPassword)  // to send Password reset OTP
router.post('/reset-user-password',resetUserPassword) //to verify OTP and update password


//find one by email
router.post('/findOne',findOneController)


router.get('/test',requireSignIn,isAdmin,testController)
    
//protected routes    
router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
})
router.get('/profile/:id',isLoggedIn,requireSignIn,profileController,)


router.post('/upload', upload.single('image'),userAuth,uploadImage);
router.get('/user/:userId',userAuth,getImage);
router.get('/getphoto',userAuth,getUploadForm)


//getting all users
router.get('/allUsers',getAllUserController)

//get all chefs
router.get("/getAllChef", getAllChefController)


//save recipies to user model
router.put('/saveRecipies/:userId',requireSignIn,saveRecipieController)
//remove saved recipies
router.put('/removeSavedRecipes/:userId', requireSignIn,removeSavedRecipieController )
//get Saved Recipes
router.post('/getSavedRecipes',getSavedRecipeController)

//chef routes
router.get('/createChef' ,userAuth,createChefController)
router.post('/addDocuments',upload.single('image'),uploadDocumentController)
router.get('/getDocuments/:userId',GetDocumentController);


//admin routes
router.get('/pendingChefApprovals', pendingApprovalsController)
router.put('/approvePending/:userId', approveChefController)

//get all users

export  default router;
