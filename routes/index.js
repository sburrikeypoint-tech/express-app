var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
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

const registerValidation = [
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('lastName').notEmpty().withMessage('Last Name is required'),
  body('email').notEmpty().withMessage('Email is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long'),
  body('password').notEmpty().withMessage('Password is required')
];


const loginValidation = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/createuser',registerValidation,async function(req, res) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    return res.redirect(`register`);
  }

  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    req.flash('error', 'user with same email already exists.');
    res.redirect("register");
  }

  const status = await User.create({ firstName, lastName, email, password });
  if (status) {
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect("login");
  }

});

router.post('/loginuser', loginValidation, async function(req, res) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    return res.redirect(`login`);
  }
  
  const { email, password } = req.body;

  const emailexist = await User.findOne({ where: { email:email } });
  if(!emailexist){
    req.flash('error', 'No email account found');
    return res.redirect("login");
  }

  const userdetails = await User.findOne({ where: { email,password } });
  if (!userdetails) {
    req.flash('error', 'Incorrect password');
    return res.redirect("login");
  }

  req.session.user = userdetails;
  req.flash('success', 'Login Success');
  return res.redirect("dashboard");
    
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
