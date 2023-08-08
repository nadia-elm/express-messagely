
const express = require('express')
const errorHandler = require('../expressError')
const User = require('../models/user')
const router = express.Router();
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config')

// Register user, access Public, 
router.post('/register', async (req,res,next) => {
 try {
  let {username } = await User.register(req.body);
  let token = jwt.sign({ username}, SECRET_KEY);
  User.updateLoginTimestamp(username);
  return res.json({token});
 
  
 } catch (error) {
  return next(error);
 }
})

// login  access public route post/auth/login
router.post('/login', async(req,res,next) => {
 try {
  const {username, password} = req.body;
  if(await User.authenticate(username, password)){
   let token = jwt.sign({username}, SECRET_KEY);
   User.updateLoginTimestamp(username);
   return res.json({token})
  }else{
   throw new errorHandler('Invalid credentials', 400)
  }
  
 } catch (error) {
  return next(error)
  
 }
})


module.exports = router


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
