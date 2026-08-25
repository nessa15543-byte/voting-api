const path = require("path")
const fs = require("fs");
const { stringify } = require("querystring");
const { hashSync, compareSync } = require("bcrypt");
const { error } = require("console");
const { CONFIG } = require("../config/env");
const { buildResponds } = require("../utils/builder");
const filepath = path.join(__dirname, "../", "accounts.json")
const jwt = require("jsonwebtoken")

const register = (req, res) => {
    try {
        const email = req.body.email;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const password = req.body.password;

        //data validation and sanitization
        if (!email) throw new Error('email is required');
        if (!firstname) throw new Error('firstname is required')
        if (!lastname) throw new Error('lastname is required');
        if (!password) throw new Error('password is required');

        if (!email.includes("@")) throw new Error("email is invalid");
        if (!isNaN(firstname)) throw new Error("firstname should be only characters")
        if (firstname.length < 2) throw new Error("firstname must be at least 3 characters");
        if (firstname.length > 30) throw new Error("firstname cannot exceed 30 characters");
        if (!isNaN(lastname)) throw new Error("lastname should be only characters");
        if (lastname.length < 2) throw new Error("lastname must be at least 3 characters");
        if (lastname.length > 30) throw new Error("lastname cannot exceed 30 characters");

        if (password.length < 8) throw new Error('password must be at least 8 characters');
        const hashedpassword = hashSync(password, 10);
        const user = {
            email,
            password: hashedpassword,
            firstname,
            lastname,
            id: Math.floor(Math.round()),
            type: "user",
        };
        //check if file exsit
        if (fs.existsSync(filepath)) {
            const readData = fs.readFileSync(filepath, "utf-8");
            const objData = JSON.parse(readData);
            const emailExist = objData.find(x => x.email === email);

            if (emailExist) return res.status(400).json({ error: "email already exist" })
            objData.push(user);
            const save = fs.writeFileSync(filepath, JSON.stringify([objData]), "utf-8");

            if (save) throw new Error(save);
        } else {
            const save = fs.writeFileSync(filepath, JSON.stringify([user]), "utf-8");
            if (save) throw new Error(save);
        }
        res.status(200).json({ msg: "registration successful" });
    } catch (error) {
        res.status(400).json({ error: error.message || "an error occured" })
    }
}
const login = (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        if (!email) throw new Error("invalid email address")
        if (!password) throw new Error("invalid password")
        if (!email.includes("@")) throw new Error("email is invalid");
        if (password === "" || password.length < 8 || password.length > 10) throw new Error('password must be at least 8 characters');

        const data = readFile(filepath);
        if (!data) throw new Error("no record found");
        const userExist = data.find(x => x.email.toLowerCase() === email.toLowerCase());
        const others = data.filter(x => x.email.toLowerCase() !== email.toLowerCase() )
        if (!userExist) throw new Error("account does not exist");
        if (!compareSync(password, userExist.password)) throw new Error("incorrect pasword");

        //console.log(req);
        let token = req?.cookie?.votin_ex;
        if (!token) token = req?.headers?.authotization?.split(' ')[1];
        if (!token) token = req?.headers?.cookie?.split("=")[1];

        if (token) {
            return res.status(401).json({ msg: "you are already logged in" });
        }
        console.log(token);

        const payload = {
            id: userExist.id,
            email,
            userType: userExist.type,
        };
        const userData = buildResponds(userExist);
        //sign access token
        const accessToken = jwt.sign(payload, CONFIG.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
        const refreshToken = jwt.sign(payload, CONFIG.REFRESH_TOKEN_SECRET, { expiresIn: "15m" });

        userExist.refreshToken = userExist.refreshToken || [];
        others.push(userExist);

        const saveRefreshToken = fs.writeFileSync(filepath, JSON.stringify(others), "utf-8");
        if (saveRefreshToken) throw new Error("No error! saving refresh token");

        res.clearCookie("voTiN_ex");
        res.cookie("voTiN_ex", accessToken, {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            maxAge: 5 * 60 * 1000,
        });

        res.status(200).json({
            msg: 'login successful',
            data: userData,
            token: accessToken,
            refreshToken: refreshToken
        });

    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message || "an error occured" })
    }
}
const readFile = () => {
    let exist;
    if (fs.existsSync(filepath)) {
        exist = fs.readFileSync(filepath, 'utf-8');
        exist = JSON.parse(exist);
        if (exist.length === 0) throw new Error('No record found');
    }
    return exist;
}
const forgotpassword = (req, res) => {
    try {
        const email = req.body.email
        const newpassword = req.body.newpassword

        if (!email) throw new Error("invalid email address")

        if (!email.includes("@")) throw new Error("email is invalid");
        if (newpassword.length < 8) throw new Error('password must be at least 8 characters');
        const user = {
            email,
            otp: Math.floor(100000 + Math.random() * 709834),
            newpassword
        }
        console.log(user),
            res.status(200).json({ message: "password reset successful" })
    } catch (error) {
        res.status(400).json({ error: error.message || "an error occured" })
    }
}

const getAccounts = (req, res) => {
    try {
        const { search } = req.query;

        if (fs.existsSync(filepath)) {
            const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
            if (data.length === 0) return res.status(400).json({ error: "no record found" });

            const { password, ...rest } = data.toObject();
            console.log(rest)
            res.status(200).json({ message: "found", data });

            if (search) {
                const findUser = data.find(x => x.email.tolowerCase() === search.tolowerCase()
                    || x.firstname.tolowerCase() === search || x.lastname.tolowerCase() === search);
                if (!findUser)throw new Error("no record found");
                const found = buildResponds(findUser);
                return res.status(200).json({msg: "found", data: found});
            } 
            data.forEach((cur) => {
                resData.push(buildResponds(cur));
            });
            res.status(200).json({error: "found", data: resData});

        }else res.status(404).json({error: "No account"});

    } catch (error) {
        res.status(400).json({ error: error.message || "an error occured" })
    }
}
const logout =(req, res) => {
    try{
        let token = req?.cookie?.votin_ex;
        if (!token) token = req?.headers?.authotization?.split(' ')[1];
        if (!token) token = req?.headers?.cookie?.split("=")[1];

        if(!token)return res.status(401).json({message:"you are not logged in"});
        const verify = jwt.verify(token, CONFIG.ACCESS_TOKEN_SECRET);
    
        if(!verify) return res.status(401).json({msg: "Expired! generate a new acess token"});

        const data = readFile(filepath)
        if(!data) throw new Error("no record found");

        const userExist = data.find(x => x.id === verify.id);
        const others = data.filter(x => x.id !== verify.id);
        if(userExist?.refreshToken){
            delete userExist.refreshToken;
            others.push(userExist);
            const save = fs.writeFileSync(filepath,JSON.stringify(others), "utf-8");
            res.clearCookie("voTiN_ex");
        }else throw new Error("you have to login first");
        res.clearCookie("voTiN_ex")
        res.status(200).json({message: "logout successful"});

    }catch(error){
        if(error.name === "TokenExpiredError") return res.status(401).json({message: "access token expired, genetate new access token"});
        res.status(400).json({error: error.message || "an error occured"})
    }
}

module.exports = {
    register,
    login,
    forgotpassword,
    getAccounts,
    readFile,
    logout
} 
