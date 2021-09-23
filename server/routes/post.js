const express = require('express');
const router = express.Router()

const Post = require('../models/Post');
const verifyToken = require('../middleware/auth');

/**
 * @route POST api/posts
 * @description Create post
 * @access private
 */
router.post('/', verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body

    // Simple validation
    if (!title) {
        return res.status(400).json({ status: false, message: 'Title is required' })
    }

    try {
        const newPost = new Post({
            title,
            description,
            url: url.startsWith('https://') ? url : `https://${url}`,
            status: status || 'TO LEARN',
            user: req.userId,
        })
        await newPost.save();

        res.json({ status: true, message: 'Happy learning!', post: newPost });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: false, message: 'Internal server error' })
    }
})

/**
 * @route GET api/posts
 * @description Get user posts
 * @access private
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const post = await Post.find({ user: req.userId })

        res.json({ status: true, message: 'success', post });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: false, message: 'Internal server error' })
    }
})

/**
 * @route PUT api/posts/:id
 * @description Create post
 * @access private
 */
router.put('/:id', verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body

    // Simple validation
    if (!title) {
        return res.status(400).json({ status: false, message: 'Title is required' })
    }
    try {
        let post = await Post.findOne({ _id: req.params.id });
        if (!post) {
            return res.status(404).json({ status: false, message: 'Post not found' });
        }
        if (post.user._id.toString() !== String(req.userId)) {
            return res.status(403).json({ status: false, message: 'Post is not yours' })
        }

        const data = {
            title,
            description: description || undefined,
            url: url ? (url.startsWith('https://') ? url : `https://${url}`) : undefined,
            status: status || undefined,
            user: req.userId,
        }
        post = await Post.findOneAndUpdate({ _id: req.params.id }, data, { new: true });

        res.json({ status: true, message: 'Post was updated successfully!', post });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: false, message: 'Internal server error' })
    }
})

/**
 * @route PUT api/posts/:id
 * @description Delete post
 * @access private
 */
router.delete('/:id', verifyToken, async (req, res) => {

    deleteConditions = { _id: req.params.id, user: req.userId };

    try {
        let deletedPost = await Post.findOneAndDelete(deleteConditions);
        if (!deletedPost) {
            return res.status(401).json({ status: false, message: 'Post not found or user unauthenticated' });
        }
        
        res.json({ status: true, message: 'Post was deleted successfully!', post: deletedPost });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: false, message: 'Internal server error' })
    }
})

module.exports = router;