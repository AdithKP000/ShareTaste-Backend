import categoryModel from "../models/categoryModel.js"
import slugify from "slugify"

 export const createCategoryController= async(req,res)=>{
    try {
        const {name} = req.body
        if(!name){
            return res.status(401).send({
                message:"name is Required",
            })
        }
        const existingCategory= await categoryModel.findOne({name})
        if ( existingCategory){
            return res.status(200).send({
                success:true,
                message:"Category already exists "
            })
        }
        const category = await new categoryModel({
            name,
            slug:slugify(name)
            
        }).save()
        console.log(category)
        res.status(201).send({
            success:true,
            message:"New Category creeated",
            category
        })
    }catch (error) {
        console.error("Category creation error:", error);
        res.status(500).send({
            success: false,
            message: "Error creating Category",
            error: error.message,
            stack: error.stac
        });
    }
 }


 export const UpdateCategoryController = async(req,res)=>{
    try {
        const {name}=req.body;
        const {id}=req.params
       const category= await categoryModel.findByIdAndUpdate(id,{name},{new:true}) 
       res.status(200).send({
        success:true,
        message:"Ctegory updated Succesfully",
        category,
       })
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success:false,
            message:"Error while updating category",
            error,
        })
    }
}



export const categoryController=async(req,res)=>{
    try {
        const category= await categoryModel.find({})
        res.status(200).send({
            success:true,
            message:"All Categories List",
            category,
        })
    } catch (error) {
        console.log(error),
        res.status(400).send({
            success:false,
            message:"unable to get all categories",
            error,
        })
    }
}



export const singleCategoryController=async (req,res)=>{
    try {
        
        const singleCategory=await categoryModel.findOne({slug:slugify(req.params.slug)})
        res.status(200).send({
            success:true,
            message:"User Found Succesfully",
            singleCategory,
        })
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success:false,
            message:"Error in finding required user",
            error,
        })
    }
}


export const deleteCategoryControlelr=async (req,res)=>{
    try {
        const {id}=req.params
        const category=await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success:true,
            message:"Succesfully deleted the Category",
            category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Unable to Delet the user",
            error,
        })
    }
}