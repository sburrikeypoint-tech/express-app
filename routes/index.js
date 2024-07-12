var express = require('express');
const multer = require('multer');
const path = require('path');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const { Post } = require('../models');
const { User } = require('../models');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', function(req, res) {
  return res.redirect("register");
});

router.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    return res.redirect('/login');
  })
});

router.get('/register', function(req, res) {
  if(!req.session.user){
    return res.render('register');
  }else{
    return res.redirect("dashboard");
  }
});

router.get('/login', function(req, res) {
  if(!req.session.user){
    return res.render('login');
  }else{
    return res.redirect("dashboard");
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


const postAddingValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('description is required')
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
    return res.redirect("register");
  }

  const status = await User.create({ firstName, lastName, email, password });
  if (status) {
    req.flash('success', 'Registration successful! Please log in.');
    return res.redirect("login");
  }

});


router.post('/updateuser',async function(req, res) {
  
  const { id, firstName, lastName, email } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    req.flash('error', 'No user account found');
    return res.redirect("back");
  }

  const newdata = {};
  if (firstName) newdata.firstName = firstName;
  if (lastName) newdata.lastName = lastName;
  if (email) newdata.email = email;

  const status = await user.update(newdata);
  req.session.user = status;
  if(status){
    req.flash('success', 'user details updated');
    return res.redirect("back");
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

// menu routes
router.get('/dashboard',async function(req, res) {

  if(!req.session.user){
    res.redirect('login');
  }

  var posts = await Post.findAll({
    attributes: ['id', 'title', 'content','userId','image'],
    order: [
      ['id', 'desc'],
    ],
  });
  return res.render('dashboard',{title:"All Posts",posts,sessionuser:req.session.user});
  
});

router.get('/myposts',async function(req, res) {

  if(!req.session.user){
    return res.redirect('login');
  }

  var posts = await Post.findAll({
    where: {
      userId: req.session.user.id
    },
    attributes: ['id', 'title', 'content','userId','image'],
  });
  return res.render('myposts',{title:"My Posts",posts,sessionuser:req.session.user});

});

router.get('/postsview/:id',async function(req, res) {
  if(!req.session.user){
    return res.redirect('login');
  }  

  id = req.params.id;
  const post = await Post.findByPk(id);
  if (post.length === 0) {
    req.flash('success', 'No post found ');
    res.redirect("back");
  }
  return res.render("postview",{post,sessionuser:req.session.user});

});

router.get('/settings',async function(req, res) {
  if(!req.session.user){
    return res.redirect('login');
  }

  var posts = await Post.findAll({
    where: {
      userId: req.session.user.id
    },
    attributes: ['id', 'title', 'content','userId'],
  });
  return res.render('settings',{title:"Settings",posts,sessionuser:req.session.user});

});

// posts routes
router.post('/creatpost',upload.single('image'),postAddingValidation,async function(req, res) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    return res.redirect(`myposts`);
  }

  if(!req.session.user){
    return res.redirect('login');
  }

  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;
  const userId = req.session.user.id;
  const status = await Post.create({ title, content:description,image, userId });
  if (status) {
    req.flash("success","Post added success");
    return res.redirect("myposts");
  }

});

router.get('/deletepost/:id',async function(req, res) {

  if(!req.session.user){
    return res.redirect('login');
  }  

  id = req.params.id;
  const post = await Post.findByPk(id);
  if (post.length === 0) {
    req.flash('success', 'No post found ');
    return res.redirect("back");
  }else{
    fs.unlink("./uploads/"+post.image, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('File is deleted.');
      }
    });
    const status = await post.destroy();
    if (status) {
      req.flash("success","Post deleted success");
      return res.redirect("back");
    }
  }

});


router.get('/editpost/:id',async function(req, res) {

  if(!req.session.user){
    return res.redirect('login');
  } 

  id = req.params.id;
  const editpost = await Post.findByPk(id);
  if (editpost.length === 0) {
    req.flash('error', 'No post found');
    return res.redirect("back");
  }else{
    return res.render('editpost',{title:"Edit Post",sessionuser:req.session.user,editpost});
  }

});


router.post('/updatepost',postAddingValidation,async function(req, res) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg));
    return res.redirect(`myposts`);
  }

  if(!req.session.user){
    return res.redirect('login');
  }

  const { id, title, description } = req.body;
  const post = await Post.findByPk(id);

  const newdata = {};
  if (title) newdata.title = title;
  if (description) newdata.content = description;

  const status = await post.update(newdata);
  if (status) {
    req.flash("success","Post updated success");
    return res.redirect("myposts");
  }
 
});

module.exports = router;
