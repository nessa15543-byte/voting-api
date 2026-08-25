const appRouter = require("express").Router();
// const express = require("express");
const authRouter = require("./auth.route");
// const appRouter = express.Router();//creating a router

appRouter.use("/auth", authRouter);




module.exports = appRouter;