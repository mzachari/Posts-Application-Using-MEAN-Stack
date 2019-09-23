const express = require("express");
const router = express.Router();

const postsController = require('../controllers/posts');
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

router.post('', checkAuth, extractFile, postsController.createPost);
router.get('', postsController.getAllPosts );

router.get('/:postId', postsController.getPost)
router.put('/:id', checkAuth, extractFile, postsController.editPost );
router.delete('/:id', checkAuth, postsController.deletePost );

module.exports = router;
