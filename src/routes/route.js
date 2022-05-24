const express = require("express");
const router = express.Router();
const usercontroller = require("../Controllers/userController");

router.post("/register", usercontroller.register)
router.post("/login", usercontroller.loginUser)
//router.put("/user/:userId/profile", usercontroller.userUpdate)



module.exports = router