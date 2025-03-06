import mongoose from "mongoose"
import Category from "../app/models/category-model.js"

const seedCategories = async () => {
    try {
        const count = await Category.countDocuments()
        if (count === 0) {
            const categories = [
                { name: 'Education' },
                { name: 'Healthcare' },
                { name: 'Environment' },
                { name: 'Disaster Relief' },
                { name: 'Animal Welfare' }
            ]
            await Category.insertMany(categories)
        }
    } catch (err) {
        console.error('Error seeding categories:', err)
    }
}

const configureDb = async() => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        await mongoose.connect(process.env.DB_URL);
        await seedCategories();
    } catch(err) {
        console.error('Database connection error:', err.message);
        // Retry connection after 5 seconds
        setTimeout(configureDb, 5000);
    }
}

export default configureDb