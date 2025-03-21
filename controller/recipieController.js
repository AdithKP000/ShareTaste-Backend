import recipieModel from "../models/recipieModel.js";

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv  from 'dotenv';
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

dotenv.config();
const genAi= new  GoogleGenerativeAI(process.env.API_KEY )


export const createRecipieController = async (req, res) => {
    try {
        const {
            name,
            ingredients,
            instructions,
            cookingTime,
            difficulty, 
            category,
        } = req.body;
        
        const image = req.file;
        console.log(req.user)
        const author = req.user?.id;
        
        console.log("Author ID:", author);

        if (!name) return res.status(400).send({ success: false, message: "Name is required" });
        if (!ingredients) return res.status(400).send({ success: false, message: "Ingredients are required" });
        if (!instructions) return res.status(400).send({ success: false, message: "Instructions are required" });
        if (!cookingTime) return res.status(400).send({ success: false, message: "Cooking time is required" });
        if (!difficulty) return res.status(400).send({ success: false, message: "Difficulty is required" });
        if (!category) return res.status(400).send({ success: false, message: "Category is required" });
        if (!author) return res.status(400).send({ success: false, message: "Authentication required" });
        
        const recipie = new recipieModel({
            name,
            ingredients: typeof ingredients === 'string' ? ingredients.split(',').map(item => item.trim()) : ingredients,
            instructions,
            cookingTime,
            difficulty,
            category,
            author,
            approvalStatus:"pending",   
        });

            //adding images using multer
        if (image) {
            recipie.image = {
                data: image.buffer,
                contentType: image.mimetype
            };
        }


        
        
        const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are a food critic with high expectations and curiosity about how any dish is made. 
        I have invited you to my restaurant, where my newly appointed chefs are preparing meals for you. 
        You must judge them based on the instructions they provide and analyze whether it is feasible to make an edible dish.
        
        The ingredient list is: ${ingredients}
        The given instructions are: ${instructions}
        
        Now, deeply analyze these to give a rating of either true or false:
        - **True (1):** The recipe is edible and feasible to make.
        - **False (0):** The recipe is fake, a troll, or contains hidden meme/double meaning elements.
        
        Your response should strictly be either **1** (true) or **0** (false).`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        const text = response.trim(); // Ensuring no extra spaces cause issues
        
        let savedRecipie = {}; // Using 'let' instead of 'const'
        
        if (text === "1") {
            savedRecipie = await recipie.save();
            console.log("Recipe saved successfully:", savedRecipie._id);
        } else {
            console.log("The recipe contained some ingredients or instructions that may cause problems. \nTherefore, we were unable to update the database with the provided recipe.");
        }




        
        res.status(201).send({
            success: true,
            message: "New Recipe created successfully",
            recipie: savedRecipie
        });
    } catch (error) {
        console.error("Recipe creation error:", error);
        res.status(500).send({
            success: false,
            message: "Error creating recipe",
            error: error.message,
            stack: error.stack
        });
    }
};

export const getAllRecipieController = async (req,res)=>{
    try {
        const recipies = await recipieModel.find({})
        .select("-image -ratings -ingredients -instructions -cookingTime -difficulty -category -allergens -dietaryPreferences -ratings -avgRating -approvalStatus -verified -likeCount -likedBy  ")
        .sort({createdAt:-1});

        res.status(200).send({
            success:true,
            message:"All Recipes",
            recipies,
        });
        
    } catch (error) {
        console.log("Uanable to find all products ")
        res.status(400).send({
            sucess:false,
            message:"Unable to find all products",
            error
        })
    }
}


export const getRecipieBannerImage = async(req,res)=>{
    try {
        
    } catch (error) {
        console.log(error)
    }
}


export const getPopularRecipieController = async(req,res)=>{
    try {
        const recipies = await recipieModel.find({})
        .select("-image -ratings -ingredients -instructions -cookingTime -difficulty -category -allergens -dietaryPreferences -ratings -avgRating -approvalStatus -verified -likeCount -likedBy  ")
        .sort({likeCount:-1});

        res.status(200).send({
            success:true,
            message:"All Recipes",
            recipies,
        });
        
    } catch (error) {
        console.log("Uanable to find all products ")
        res.status(400).send({
            sucess:false,
            message:"Unable to find all products",
            error
        })
    }
}

export const recentRecipeController= async(req,res)=>{
    try {
        const recipies = await recipieModel.find({})
        .select("-image -ratings -ingredients -instructions -cookingTime -difficulty -category -allergens -dietaryPreferences -ratings -avgRating -approvalStatus -verified -likeCount -likedBy  ")
        .sort({createdAt:-1});

        res.status(200).send({
            success:true,
            message:"All Recipes",
            recipies,
        });
        
    } catch (error) {
        console.log("Uanable to find recent recipes ")
        res.status(400).send({
            success:false,
            message:"Unable to find recent recipes",
            error
        })
    }
}


export const getSimilarRecipeController = async(req,res)=>{
    try {
        const {rid}=req.params;
        const {cid}= req.params;
        if(!cid){
            console.log("Unable to get Category ID");
            res.status(400).send({success:false, message:"Unable to find Cat ID"})
        }

        const recipies= await recipieModel.find({category:cid,  _id: { $ne: rid }} ) 
        .select("-image -ratings -ingredients -instructions -cookingTime -difficulty -category -allergens -dietaryPreferences -ratings -avgRating -approvalStatus -verified -likeCount -likedBy  ");

        
        if(!recipies)
        {   console.log("Unable to find  Recipies")
            res.status(400).send({
                success:false,
                message:"Unable to find Thre  recipies with the given category"
                })
        }
        res.status(200).send({
            success:true,
            message:"Succesfully found similar Recipies",
            recipies,
        })


        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Unable to find similar recipes",
            error,
        })
    }
}


export const getRecipieImage = async(req,res)=>{
    try {
            const { recipieId } = req.params;
                if (!recipieId) {
                    return res.status(400).json({
                        success: false,
                        message: 'recipie ID is required'
                    });
                }
                const recipie = await recipieModel.findById(recipieId)
                .select("--ratings -ingredients -instructions -cookingTime -difficulty -category -allergens -dietaryPreferences -ratings -avgRating -approvalStatus -verified -likeCount -likedBy  ");
          
              if (!recipie || !recipie.image || !recipie.image.data) {
                return res.status(404).json({
                  success: false,
                  message: 'Image not found'
                });
              }
          
              res.set('Content-Type', recipie.image.contentType);
              res.send(recipie.image.data);
        
    } catch (error) {
        console.log("Unablr to fetch user Data ",error);
        res.status(500).send({
            success:false,
            message:"Unable to fetch  recipieImage",
            error
        })

    }
}



export const getUserRecipieController= async(req,res)=>{
    try {
        const { userId } = req.params;
        if (!userId) {
            console.log("Unable to obtain u serd Id from the req:params ");
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }       
    
        const recipes = await recipieModel.find({ author:userId });

        if(!recipes){
            console.log("Unablr to find recipes  \n error while performing axios opeartion");
        }
        res.status(200).send({
            success:true,
            message:"succesfully find the recipes of the given user",
            recipes,
        })
        
    } catch (error) {
        console.log(" error occured while getting recipie  \n error recieved by Catch statement on server side"+error);
        res.status(500).send({
            success:false,
            message:"Unable to fetch user recipie",
            error
        })
    }


}


export const getRecipieController = async(req,res)=>{
    try {
        const {recipieId}= req.params
        console.log(recipieId);

        const recipie=  await recipieModel.findById(recipieId)
        if(!recipie)
        {
            console.log("unable to find Recipie ")
            res.status(400).send({
                success:false,
                message:" Unable to find the given recipie",
            })
        }
        res.status(200).send({
            success:true,
            message:"sucesfully Obtained the recipie",
            recipie,

        })

        
    } catch (error) {
        console.log("unable to get single recipie")

        res.status(500).send({
            success:false,
            message:"Unable to get single Recipie",
            error,
        })
    }
}

export const searchRecipeController= async( req,res)=>{
    try {
        const { keyword } = req.params;
        const userId = req.user?.id;


        console.log(userId);

        const user= await userModel.findById(userId);
        if(!user){
            console.log("user was not found")

        }
    const userAllergens = user.alergies;
    console.log(userAllergens)

        const results = await recipieModel
       .find({ $and: [
        {
            $or: [
                { name: { $regex: keyword, $options: "i" } },  
                { ingredients: { $in: [keyword] } },  
                { dietaryPreferences: { $in: [keyword] } }  
            ]
        },
        {
            ingredients: { $nin: userAllergens } 
        }
    ]
            })
        .select("-photo");
       
            res.status(200).send({
                success: true,
                message:"succesfully Found Recipeis",
                results,
            })
        
        
      } catch (error) {
        console.log(error);
        res.status(400).send({
          success: false,
          message: "Error In Search Product API",
          error,
        });
      }
    }; 


    export const getPendingRecipieController= async(req,res)=>{
        try {
            const recipies = await recipieModel.find({ approvalStatus: "pending" });
            if(!recipies || recipies.length===0)
            {
                console.log("Unable to find Recipie approval request");
            }
            res.status(200).send({
                success:true,
                message:"Recipie approval request found",
                recipies,
            })
            
        } catch (error) {
            console.log("Error occures",error);
            res.status(500).send({
                success:false,
                message:"unable to obtain Recipe Approval request",
                error,
            })
        }
    }


    export const approveRequestController = async(req,res)=>{
        try {
            const {id}=req.params;

            const recipie= await recipieModel.findByIdAndUpdate(id,{ approvalStatus: "approved" , verified:true}, { new: true })

            if (!recipie) {
                console.log("Unable to find recipe for approval.");
                return res.status(404).send({
                    success: false,
                    message: "Recipe not found",
                });
            }
    
            res.status(200).send({
                success: true,
                message: "Successfully approved the recipe",
                recipie, 
            });
        } catch (error) {
            console.log("Unbale to Approve recipe Request",error);
            res.status(500).send({
                success:false,
                message:"Unable to obtain Recipie request controller",
                error,
            })
        }
    }


    export const likeRecipieController = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id; 
            console.log(id,userId);
            
            const recipe = await recipieModel.findById(id);
        if (!recipe) {
            return res.status(404).send({ success: false, message: "Recipe not found" });
        }

        if (recipe.likedBy.includes(userId)) {
            return res.status(400).send({ success: false, message: "You have already liked this recipe" });
        }

        recipe.likedBy.push(userId);
        recipe.likeCount = recipe.likedBy.length; // Ensure consistency
        await recipe.save();
    
            res.status(200).send({ success: true, message: "Recipe liked successfully", recipe });
    
        } catch (error) {
            console.error("Error liking recipe:", error);
            res.status(500).send({
                success: false,
                message: "Unable to like recipe",
                error,
            });
        }
    };
    

    export const unlikeRecipieController = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
    
            if (!userId) {
                return res.status(401).send({ success: false, message: "Unauthorized: User not logged in" });
            }
    
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ success: false, message: "Invalid recipe ID" });
            }
    
            const recipe = await recipieModel.findById(id);
            if (!recipe) {
                return res.status(404).send({ success: false, message: "Recipe not found" });
            }
    
            if (!recipe.likedBy.includes(userId)) {
                return res.status(400).send({ success: false, message: "You haven't liked this recipe yet" });
            }
    
            // Remove the user from likedBy array & update likeCount
            recipe.likedBy = recipe.likedBy.filter(user => user.toString() !== userId);
            recipe.likeCount = recipe.likedBy.length;
            await recipe.save();
    
            res.status(200).send({ success: true, message: "Recipe unliked successfully", recipe });
    
        } catch (error) {
            console.error("Error unliking recipe:", error);
            res.status(500).send({
                success: false,
                message: "Unable to unlike recipe",
                error,
            });
        }
    };
    export const getRecipieByUserNameController = async (req, res) => {
        try {
            const { userName } = req.params;
            
            // Find users with similar names using regex for partial matching
            const users = await userModel.find({ 
                name: { $regex: userName, $options: 'i' } 
            });
            
            if (!users || users.length === 0) {
                return res.status(200).send({
                    success: false,
                    results: [],
                    message: "No users found with that name",
                });
            }
            
            // Get the user IDs
            const userIds = users.map(user => user._id);
            
            // Find recipes created by these users
            const recipes = await recipieModel.find({ author: { $in: userIds } })
                .select("-image.data") // Avoid sending large image data
                .populate('author', 'name')
                .sort({ createdAt: -1 });
            
            // Map recipes to include username for frontend display
            const resultsWithUsername = recipes.map(recipe => ({
                ...recipe._doc,
                username: recipe.author ? recipe.author.name : 'Unknown'
            }));
            
            return res.status(200).send({
                success: true,
                message: "Recipes fetched successfully",
                results: resultsWithUsername
            });
            
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: false,
                message: "Error in fetching recipes by user name",
                results: [],
                error
            });
        }
    };

    export const searchByCategoryController = async(req, res) => {
        try {
            const { keyword } = req.params;
            const userId = req.user?.id;
    
            // Find the user to check for allergens
            const user = await userModel.findById(userId);
            const userAllergens = user?.alergies || [];
            
            // First find the category by name to get its ID
            const category = await mongoose.model('category').findOne({ 
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { slug: { $regex: keyword, $options: 'i' } }
                ]
            });
            
            if (!category) {
                return res.status(200).send({
                    success: true,
                    message: "No recipes found for this category",
                    results: [],
                });
            }
            
            // Now use the category ID to find recipes
            const results = await recipieModel
                .find({ 
                    $and: [
                        { category: category._id }, // Use the ObjectId here
                        { ingredients: { $nin: userAllergens } }
                    ]
                })
                .select("-photo");
           
            res.status(200).send({
                success: true,
                message: "Successfully found recipes by category",
                results,
            });
            
        } catch (error) {
            console.log(error);
            res.status(400).send({
                success: false,
                message: "Error in search by category API",
                error,
            });
        }
    };
    
    export const searchByExactIngredientsController = async(req, res) => {
        try {
            const { ingredients } = req.body;
            const userId = req.user?.id;
    
            if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
                return res.status(400).send({
                    success: false,
                    message: "Please provide at least one ingredient",
                    results: []
                });
            }
    
            // Clean ingredients array (remove empty strings, trim whitespace)
            const cleanedIngredients = ingredients
                .map(ing => ing.trim())
                .filter(ing => ing.length > 0);
    
            // Find the user to check for allergens
            const user = await userModel.findById(userId);
            const userAllergens = user?.alergies || [];
            
            // Find recipes that have EXACTLY these ingredients
            // This means the recipe's ingredients array length must match
            // and all the ingredients must be in our search list
            const results = await recipieModel.find({
                $and: [
                    // All ingredients must be from our list
                    { ingredients: { $not: { $elemMatch: { $nin: cleanedIngredients } } } },
                    // Recipe must use all of our ingredients
                    { ingredients: { $size: cleanedIngredients.length } },
                    // Exclude recipes with allergens
                    { ingredients: { $nin: userAllergens } }
                ]
            }).select("-photo");
            
            res.status(200).send({
                success: true,
                message: "Successfully found recipes with exact ingredients",
                results,
            });
            
        } catch (error) {
            console.log(error);
            res.status(400).send({
                success: false,
                message: "Error in exact ingredients search API",
                error,
            });
        }
    };
    
    // Search for recipes containing AT LEAST these ingredients
    export const searchByPartialIngredientsController = async(req, res) => {
        try {
            const { ingredients } = req.body;
            const userId = req.user?.id;
    
            if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
                return res.status(400).send({
                    success: false,
                    message: "Please provide at least one ingredient",
                    results: []
                });
            }
    
            // Clean ingredients array (remove empty strings, trim whitespace)
            const cleanedIngredients = ingredients
                .map(ing => ing.trim())
                .filter(ing => ing.length > 0);
    
            // Find the user to check for allergens
            const user = await userModel.findById(userId);
            const userAllergens = user?.alergies || [];
            
            // Find recipes that contain AT LEAST these ingredients
            // This means all of our search ingredients must be in the recipe
            const results = await recipieModel.find({
                $and: [
                    // All our ingredients must be present in the recipe
                    { ingredients: { $all: cleanedIngredients } },
                    // Exclude recipes with allergens
                    { ingredients: { $nin: userAllergens } }
                ]
            }).select("-photo");
            
            res.status(200).send({
                success: true,
                message: "Successfully found recipes containing the ingredients",
                results,
            });
            
        } catch (error) {
            console.log(error);
            res.status(400).send({
                success: false,
                message: "Error in partial ingredients search API",
                error,
            });
        }
    };