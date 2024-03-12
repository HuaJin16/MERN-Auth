const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working');
}

// Register Endpoint
const registerUser = async(req, res) => {
    try{
        const {name, email, password} = req.body;
        // Check if name was entered
        if(!name) {
            return res.json({
                error: 'Name is required'
            })
        }
        //Check if password is good
        if(!password || password.length < 6) {
            return res.json({
                error: 'Password is required and should be at least 6 chracters long'
            })
        }
        // Check is email exists in the database
        const exist = await User.findOne({email});
        if(exist) {
            return res.json({
                error: 'Email is taken already'
            })
        }

        const hashedPassword = await hashPassword(password);
        
        // Create user in database
        const user = await User.create({
            name, email, password: hashedPassword
        })

        return res.json(user);
    } catch(error) {
        console.log(error);
    }
}

// Login Endpoint
const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;

        // Check if suer exists
        const user = await User.findOne({email});
        if(!user) {
            return res.json({
                error: 'No user found'
            })
        }

        // Check if passwords match
        // password is the user inputted value
        // user.password is the password provided when the user registered (in the database)
        const match = await comparePassword(password, user.password);
        if(match) {
            jwt.sign({email: user.email, id: user._id, name: user.name}, process.env.JWT_SECRET, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(user);
            })
        }
        if(!match) {
            res.json({
                error: 'Passwords do not match'
            })
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    test,
    registerUser,
    loginUser
}