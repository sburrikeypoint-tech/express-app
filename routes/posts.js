var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');

router.get('/:id?', postController.getPosts);
router.post('/', postController.createPosts);
router.delete('/:id', postController.deletePosts);
router.put('/:id', postController.updatePosts);


router.get('/userposts', async function(req, res, next) {
 
    try {
      const posts = await Post.findAll({
        attributes: ['id', 'title', 'content', 'userId'], // Specify Post attributes
      });
  
      const postsWithUser = await Promise.all(posts.map(async (post) => {
        const user = await User.findByPk(post.userId, {
          attributes: ['firstName'], 
        });
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          userName: user.firstName, 
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
      }));
  
      res.json(postsWithUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
