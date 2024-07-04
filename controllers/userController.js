const { User } = require('../models');
const { check, param, validationResult } = require('express-validator');

const postValidation = [
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').notEmpty().withMessage('Password is required'),
];

const deleteValidation = [
  check('id').notEmpty().withMessage('id is required')
];

const putValidation = [
  param('id').isInt().withMessage('ID must be an integer'),
  check('firstName').optional().notEmpty().withMessage('First name is required'),
  check('lastName').optional().notEmpty().withMessage('Last name is required'),
  check('email').optional().isEmail().withMessage('Invalid email format'),
  check('password').optional().notEmpty().withMessage('Password is required'),
];

exports.getUsers = async (req, res) => {

  try {
    id = req.params.id;
    if (id) {
      var users = await User.findByPk(id);
      if (!users) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      var users = await User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email'],
      });
    }
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // const userData = users.map(user => ({
    //   id: user.id,
    //   fullname: `${user.firstName} ${user.lastName}`,
    //   email: user.email,
    // }));

    res.json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }

};

exports.createUsers = [postValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const status = await User.create({ firstName, lastName, email, password });
    if (status) {
      return res.status(200).json({ message: 'User created success' });
    }
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}]

exports.deleteUsers =[deleteValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const status = await user.destroy();
    if (status) {
      return res.status(200).json({ message: 'User deleted success' });
    }
    // or
    // const deleteduser =  await User.destroy({ where: { id : id } });
    // if (deleteduser) {
    //   return res.status(400).json({ message: 'User deleted success' });
    // }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }


}]

exports.updateUsers = [putValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const id = req.params.id;
  const { firstName, lastName, email,password } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ message: "unable to find user" });
    }

    const newdata = {};
    if (firstName) newdata.firstName = firstName;
    if (lastName) newdata.lastName = lastName;
    if (email) newdata.email = email;
    if (password) newdata.password = password;


    const status = await user.update(newdata);
    if(status){
      return res.status(200).json({ message: 'User updated success' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }


}]
