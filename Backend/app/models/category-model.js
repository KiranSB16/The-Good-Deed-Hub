import {Schema , model} from "mongoose"
const categorySchema = new Schema ({
    name : String
}, {timestamps : true})

const Category = model("Category" , categorySchema)
export default Category