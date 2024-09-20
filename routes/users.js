var express = require('express');
var router = express.Router();
const UserController = require('../controllers/userController');

router.get('/:id?', UserController.getUsers);
router.post('/', UserController.createUsers);
router.delete('/:id', UserController.deleteUsers);
router.put('/:id', UserController.updateUsers);

module.exports = router;
// hello
