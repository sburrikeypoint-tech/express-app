var express = require('express');
var router = express.Router();
const { Post } = require('../models');
const { User } = require('../models');

router.get('/', function(req, res) {
  res.redirect("register");
});

router.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    res.redirect('/login');
  })
});

router.get('/register', function(req, res) {
  if(!req.session.user){
    res.render('register');
  }else{
    res.redirect("dashboard");
  }
});

router.get('/login', function(req, res) {
  if(!req.session.user){
    res.render('login');
  }else{
    res.redirect("dashboard");
  }
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
  const userdetails = await User.findOne({ where: { email,password } });
  if (userdetails) {
    req.session.user = userdetails;
    res.redirect("dashboard");
  }else{
    res.end("somehting went wrong");
  }
});

router.get('/dashboard',async function(req, res) {
  if(req.session.user){
    var posts = await Post.findAll({
      attributes: ['id', 'title', 'content','userId'],
      order: [
        ['id', 'desc'],
      ],
    });
    res.render('dashboard',{title:"All Posts",posts,sessionuser:req.session.user});
  }else{
    res.redirect('login');
  }
});


router.get('/postsview/:id',async function(req, res) {
  if(req.session.user){
    id = req.params.id;
    const post = await Post.findByPk(id);
    if (post.length === 0) {
      return res.end({message: 'No posts found' });
    }
    res.render("postview",{post,sessionuser:req.session.user});
  }else{
    res.redirect('login');
  }  
});


router.get('/deletepost/:id',async function(req, res) {
  if(req.session.user){
    id = req.params.id;
    const post = await Post.findByPk(id);
    if (post.length === 0) {
      return res.end({message: 'No posts found' });
    }else{
      const status = await post.destroy();
      if (status) {
        res.redirect("back");
      }
    }
  }else{
    res.redirect('login');
  }  
});


router.get('/myposts',async function(req, res) {
  if(req.session.user){
    var posts = await Post.findAll({
      where: {
        userId: req.session.user.id
      },
      attributes: ['id', 'title', 'content','userId'],
    });
    res.render('myposts',{title:"My Posts",posts,sessionuser:req.session.user});
  }else{
    res.redirect('login');
  }
});


router.get('/settings',async function(req, res) {
  if(req.session.user){
    var posts = await Post.findAll({
      where: {
        userId: req.session.user.id
      },
      attributes: ['id', 'title', 'content','userId'],
    });
    res.render('settings',{title:"Settings",posts,sessionuser:req.session.user});
  }else{
    res.redirect('login');
  }
});


router.post('/creatpost',async function(req, res) {
  if(req.session.user){
    const { title, description } = req.body;
    const userId = req.session.user.id;
    const status = await Post.create({ title, content:description, userId });
    if (status) {
      res.redirect("myposts");
    }
  }else{
    res.redirect('login');
  }
});

module.exports = router;
