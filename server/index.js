require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');

const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');

const connectDb = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-learnit.r21zf.mongodb.net/mern-learnit?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
    
}

connectDb();

const app = express();
app.use(express.json())

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

const PORT = 5000;
app.listen(PORT, console.log(`Server listening on port ${PORT}`));