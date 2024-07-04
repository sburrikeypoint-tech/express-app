var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');

router.get('/:id?', postController.getPosts);
router.post('/', postController.createPosts);
router.delete('/:id', postController.deletePosts);
router.put('/:id', postController.updatePosts);

module.exports = router;
