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

router.post('/loginuser',async function(req, res) {

  const { email, password } = req.body;
  const existingUser = await User.findOne({ where: { email,password } });
  if (existingUser) {
    res.redirect("dashboard");
  }else{
    res.end("somehting went wrong");
  }
});

router.get('/dashboard',async function(req, res) {
  var posts = await Post.findAll({
    attributes: ['id', 'title', 'content','userId'],
  });
  res.render('index',{posts});
});


router.get('/postsview/:id',async function(req, res) {
    id = req.params.id;
    const post = await Post.findByPk(id);
    if (post.length === 0) {
      return res.end({message: 'No posts found' });
    }
    res.render("postview",{post});
});



module.exports = router;
