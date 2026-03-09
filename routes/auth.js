var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler')
let { changePasswordValidation, validateResult } = require('../utils/validationHandler')


router.post('/register', async function (req, res, next) {
  let newUser = await userController.CreateAnUser(
    req.body.username,
    req.body.password,
    req.body.email,
    '69a4f929f8d941f2dd234b88'
  )
  res.send(newUser)
});
router.post('/login', async function (req, res, next) {
  let { username, password } = req.body;
  let getUser = await userController.FindByUsername(username);
  if (!getUser) {
    res.status(404).send({
      message: "username khong ton tai hoac thong tin dang nhap sai"
    })
    return;
  }
  let result = bcrypt.compareSync(password, getUser.password);
  if (result) {
    let token = jwt.sign({
      id: getUser._id,
      exp: Date.now() + 3600 * 1000
    }, "HUTECH")
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });
    res.send(token)
  } else {
    res.status(404).send({
      message: "username khong ton tai hoac thong tin dang nhap sai"
    })
  }
});
//localhost:3000
router.get('/me', checkLogin, async function (req, res, next) {
  let user = await userController.FindByID(req.userId);
  res.send(user)
});
router.post('/logout', checkLogin, function (req, res, next) {
  res.cookie('token', null, {
    maxAge: 0,
    httpOnly: true
  })
  res.send("logout")
})

router.put('/change-password', checkLogin, changePasswordValidation, validateResult, async function (req, res, next) {
  try {
    let { oldPassword, newPassword } = req.body
    await userController.changePassword(req.userId, oldPassword, newPassword)
    res.send({ message: 'doi mat khau thanh cong' })
  } catch (error) {
    if (error.message === 'old password is incorrect') {
      return res.status(400).send({ message: 'old password is incorrect' })
    }
    if (error.message === 'user not found') {
      return res.status(404).send({ message: 'user not found' })
    }
    return res.status(400).send({ message: error.message })
  }
})


module.exports = router;


//mongodb
