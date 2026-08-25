const express = require("express");
const { login, register ,forgotpassword, getAccounts, logout} = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgotpassword",forgotpassword);
authRouter.get("/account",getAccounts)
authRouter.post("/logout", logout);

module.exports = authRouter;