const express = require("express");
const appRouter = require("./routes/appRouter");
const { configDotenv } = require("dotenv");
const app = express();
configDotenv();
const cors = require("cors");
const { CONFIG, WHITE_LIST } = require("./config/env");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
    cors({

    origin: function(origin,cb){
        if(!origin || WHITE_LIST.includes(origin)){
            return cb(null, true)
        }else{
            return cb(new Error("not allowed by CORS"))
        }
    },
    methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
    credential: true,
}))
const PORT = CONFIG.PORT || 4000;
app.use("/api",appRouter)

app.get("/status",(req, res) =>{
    res.send("yes! welcome to voting API")
})



// const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})