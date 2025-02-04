import { validationResult } from "express-validator";
import Category from "../models/category-model.js";
const categoryCltr = {}

categoryCltr.create = async(req , res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(404).json({error : errors.array()})
    }
    const { name } = req.body
    try{
        const category = new Category({name})
        console.log(category)
        await category.save()
        res.status(201).json({message : "Category created" , data : category})
    } catch(err){
        console.log(err)
        res.status(500).json("Something went wrong")
    }
}

categoryCltr.list = async(req , res) => {
    try{
        const categories = await Category.find()
        res.status(200).json(categories)
    } catch(err){
        console.log(err)
        res.status(500).json("Something went wrong")
    }
}

categoryCltr.show = async(req , res) => { 
    const id = req.params.id
    try{
        const category = await Category.findById(id)
        if(!category){
            return res.status(404).json("Category not found")
        }
        res.status(200).json(category)
    } catch(err){
        console.log(err)
        res.status(400).json("Something went wrong")
    }
}

categoryCltr.delete = async(req , res) => {
    const id = req.params.id
    try{
        const category = await Category.findByIdAndDelete(id)
        if(!category){
            return res.status(404).json("Category not found")
        }
        res.status(200).json(category)
    } catch(err){
        console.log(err)
        res.status(400).json("Something went wrong")
    }
}
export default categoryCltr