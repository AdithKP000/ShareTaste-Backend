import express from "express";
import {approveRequestController, createRecipieController, getAllRecipieController, getPendingRecipieController, 
    getPopularRecipieController, 
    getRecipieController, getRecipieImage, getUserRecipieController, likeRecipieController, recentRecipeController, searchRecipeController, unlikeRecipieController} from './../controller/recipieController.js';
import upload from "../middlewares/uploadMiddleware.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";



const router=express.Router()



router.post('/createRecipie' ,upload.single('image'), requireSignIn,createRecipieController)
router.get('/getimage/:recipieId',getRecipieImage)


router.get('/getAllRecipie',getAllRecipieController)

//get popular recipe
router.get('/popularRecipie',getPopularRecipieController)


//get single recipie
router.get('/getRecipie/:recipieId',getRecipieController)
//get recent recipe
router.get('/recentRecipe',recentRecipeController)


//get recipie created by one person using authorId
router.get('/getRecipieByUser/:userId',getUserRecipieController)


//searching recipies
router.get('/searchRecipies/:keyword',requireSignIn, searchRecipeController);


//getting  Recipies Which need to be verified]
router.get('/getPendingRecipies', getPendingRecipieController)

//aproving recipie Request
router.put('/approveRecipieRequest/:id',approveRequestController)


//increase like count of recipie
router.put('/likeRecipie/:id',requireSignIn,likeRecipieController)
//unclike counter
router.put('/unlikeCounter/:id',requireSignIn,unlikeRecipieController)
export default router;