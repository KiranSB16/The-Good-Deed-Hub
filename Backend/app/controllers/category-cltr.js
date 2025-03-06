import { validationResult } from "express-validator";
import Category from "../models/category-model.js";
import mongoose from "mongoose";

const categoryCltr = {}

categoryCltr.create = async(req , res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(404).json({error : errors.array()})
    }
    const { name } = req.body
    try{
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }
        const category = new Category({name})
        console.log('Creating category:', category)
        await category.save()
        res.status(201).json({message : "Category created" , data : category})
    } catch(err){
        console.error('Error creating category:', err)
        res.status(500).json({message: "Failed to create category", error: err.message})
    }
}

categoryCltr.list = async(req , res) => {
    try{
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }

        console.log('MongoDB connection state:', mongoose.connection.readyState);
        console.log('Fetching categories...');
        
        const categories = await Category.find()
        console.log('Found categories:', categories)
        
        if (!categories) {
            return res.status(200).json([]);
        }
        
        res.status(200).json(categories)
    } catch(err){
        console.error('Error fetching categories:', {
            error: err,
            message: err.message,
            stack: err.stack,
            mongoState: mongoose.connection.readyState
        })
        res.status(500).json({
            message: "Failed to fetch categories", 
            error: err.message,
            mongoState: mongoose.connection.readyState
        })
    }
}

categoryCltr.show = async(req , res) => { 
    const id = req.params.id
    try{
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }
        console.log('Fetching category by id:', id)
        const category = await Category.findById(id)
        if(!category){
            console.log('Category not found:', id)
            return res.status(404).json({message: "Category not found"})
        }
        console.log('Found category:', category)
        res.status(200).json(category)
    } catch(err){
        console.error('Error fetching category:', err)
        res.status(500).json({message: "Failed to fetch category", error: err.message})
    }
}

categoryCltr.delete = async(req , res) => {
    const id = req.params.id
    try{
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }
        console.log('Deleting category:', id)
        const category = await Category.findByIdAndDelete(id)
        if(!category){
            console.log('Category not found for deletion:', id)
            return res.status(404).json({message: "Category not found"})
        }
        console.log('Deleted category:', category)
        res.status(200).json(category)
    } catch(err){
        console.error('Error deleting category:', err)
        res.status(500).json({message: "Failed to delete category", error: err.message})
    }
}

export default categoryCltr