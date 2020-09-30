const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
// landing page
router.get("/", (req, res) => {
    res.sendFile("index.html", { root: path.join(__dirname, "../client") });
});
// Show register form
router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: path.join(__dirname, "../client") })
})
// Saving user to DB
router.post("/register", async (req, res) => {
    try {
        // check if email already exist
        const foundUserEmail = await User.find({ email: req.body.email });
        // if email exists don't let user register
        if (foundUserEmail.length > 0) {
            res.send("Email already in use, try a different Email");
        }
        // otherwise create the user
        else {
            // Hashing password for the new user
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({ username: req.body.username, email: req.body.email, password: hashedPassword });
            // insert user into DB
            User.create(newUser).then(user => {
                console.log(user.username + " has been saved to DB");
                res.redirect("/")
            }).catch(err => {
                console.log(err);
                return res.redirect("/register");
            })
        }
    } catch {
        res.status(500).send();
    }
});

router.post("/login", async (req, res) => {
    const user = await User.find({ username: req.body.username });
    if (user == null) {
        return res.status(400).send("Cannot find user");
    }
    try {
        // If input password and encrypted password coincide
        // we'll let user to go in the selected room
        if (await bcrypt.compare(req.body.password, user[0].password)) {
            res.redirect(`/chat?username=${req.body.username}&room=${req.body.room}`);
        }
        // If not, we'll not allow user to enter room
        else {
            res.send("Wrong password, try again");
        }
    }
    catch {
        res.status(500).send()
    }
})

router.get("/chat", (req, res) => {
    res.sendFile("chat.html", { root: path.join(__dirname, "../client") })
})

module.exports = router