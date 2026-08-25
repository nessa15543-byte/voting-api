const express = require("express");
const appRouter = require("./routes/appRouter");
const { configDotenv } = require("dotenv");
const app = express();
configDotenv();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api",appRouter)

app.get("/status",(req, res) =>{
    res.send("yes! welcome to voting API")
})



const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})