const { configDotenv } = require("dotenv")

configDotenv();

exports.CONFIG = {
    PORT:process.env.process,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET
}