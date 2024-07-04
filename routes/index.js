var express = require('express');
var router = express.Router();
const { Post } = require('../models');
const { User } = require('../models');

router.get('/', function(req, res) {
  res.redirect("register");
});

router.get('/logout', function(req, res) {
  res.redirect("login");
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/createuser',async function(req, res) {
 
  const { firstName, lastName, email, password } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    res.render("register",{ message: 'User already exists' });
  }
  const status = await User.create({ firstName, lastName, email, password });
  if (status) {
    res.render("login",{ message: 'User created success' });
  }

});


router.get('/dashboard', function(req, res) {
  res.render('index');
});

router.post('/loginuser',async function(req, res) {

  const { email, password } = req.body;
  const existingUser = await User.findOne({ where: { email,password } });
  if (existingUser) {
    res.redirect("dashboard");
  }else{
    res.end("somehting went wrong");
  }
});





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
