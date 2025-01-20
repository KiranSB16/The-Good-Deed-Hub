import mongoose from "mongoose"
const configureDb = async() => {
    try{
        const db = await mongoose.connect(process.env.DB_URL)
        console.log("Connected to the db")
    }catch(err){
        console.log(err)
    }

}
export default configureDb