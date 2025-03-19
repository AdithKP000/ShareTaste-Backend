

import  express  from 'express';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { categoryController, createCategoryController, deleteCategoryControlelr, singleCategoryController, UpdateCategoryController } from '../controller/categoryController.js';

const router=express.Router()


router.post('/create-category',requireSignIn,createCategoryController)


router.put("/update-category/:id" ,requireSignIn,isAdmin,UpdateCategoryController)


//get all category
router.get("/get-category",categoryController)

//single category
router.get('/single-category/:catId',singleCategoryController)

//delete Category 
router.delete ('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryControlelr)


export default router