const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');


/**
 * @route POST api/auth/register
 * @description Register user
 * @access public
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res
            .status(400)
            .json({ status: false, message: 'Missing username and/or password' });
    }

    try {
        // Check for existing user
        const user = await User.findOne({ username })
        if (user) {
            return res
                .status(400)
                .json({ status: false, message: 'Username already in use' });
        }

        // All good
        const hashedPassword = await argon2.hash(password)
        const newUser = new User({
            username, password: hashedPassword,
        })
        await newUser.save();

        // Return token
        const accessToken  = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET);

        return res.json({ status: true, message: 'User created successfully', accessToken});
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server Error'})
    }
})

/**
 * @route POST api/auth/login
 * @description Login user
 * @access public
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res
            .status(400)
            .json({ status: false, message: 'Missing username and/or password' });
    }

    try {
        // Check for existing user
        const user = await User.findOne({ username });
        if (!user) {
            res.status(400).json({ status: false, message: 'Incorrect username or password' });
        }

        // Username found
        const passwordValid = await argon2.verify(user.password, password)
        if (!passwordValid) {
            res.status(400).json({ status: false, message: 'Incorrect username or password'})
        }

        const accessToken = jwt.sign({ userId: user._id}, process.env.ACCESS_TOKEN_SECRET)

        // All good
        return res.json({ status: true, message: 'User logged in  successfully', accessToken});
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server Error'})
    }
})

module.exports = router;