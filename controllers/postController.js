const { Post } = require('../models');
const { check, param, validationResult } = require('express-validator');

const postValidation = [
  check('title').notEmpty().withMessage('First name is required'),
  check('content').notEmpty().withMessage('Last name is required'),
  check('userId').notEmpty().withMessage('userId is required'),
];

const deleteValidation = [
  check('id').notEmpty().withMessage('id is required')
];

const putValidation = [
  param('id').isInt().withMessage('ID must be an integer'),
  check('title').optional().notEmpty().withMessage('First name is required'),
  check('content').optional().notEmpty().withMessage('Last name is required'),
  check('userId').optional().notEmpty().withMessage('userId is required'),
];

exports.getPosts = async (req, res) => {

  try {
    id = req.params.id;
    if (id) {
      var posts = await Post.findByPk(id);
    } else {
      var posts = await Post.findAll({
        attributes: ['id', 'title', 'content','userId'],
      });
    }
    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found' });
    }

    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }

};

exports.createPosts = [postValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, email, userId } = req.body;

  try {
    const existingPost = await Post.findOne({ where: { email } });
    if (existingPost) {
      return res.status(400).json({ message: 'Post already exists' });
    }

    const status = await Post.create({ title, content, email, userId });
    if (status) {
      return res.status(200).json({ message: 'Post created success' });
    }
    res.json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}]

exports.deletePosts =[deleteValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id;

  try {
    const user = await Post.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const status = await user.destroy();
    if (status) {
      return res.status(200).json({ message: 'Post deleted success' });
    }
    // or
    // const deleteduser =  await Post.destroy({ where: { id : id } });
    // if (deleteduser) {
    //   return res.status(400).json({ message: 'Post deleted success' });
    // }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }


}]

exports.updatePosts = [putValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const id = req.params.id;
  const { title, content, email,userId } = req.body;

  try {
    const user = await Post.findByPk(id);
    if (!user) {
      return res.status(400).json({ message: "unable to find user" });
    }

    const newdata = {};
    if (title) newdata.title = title;
    if (content) newdata.content = content;
    if (email) newdata.email = email;
    if (userId) newdata.userId = userId;


    const status = await user.update(newdata);
    if(status){
      return res.status(200).json({ message: 'Post updated success' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }


}]
