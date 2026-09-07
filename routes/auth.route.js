const express = require("express");
const { login, register ,forgotpassword, getAccounts, logout, refreshToken, check} = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgotpassword",forgotpassword);
authRouter.get("/account",getAccounts)
authRouter.post("/logout", logout);
authRouter.post("/refreshToken", refreshToken);
authRouter.post("/check", check);

module.exports = authRouter;