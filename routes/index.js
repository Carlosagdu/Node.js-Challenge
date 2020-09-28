var express = require("express");
var router = express.Router();
var path = require("path");
var bcrypt = require("bcrypt");
var User = require("../models/userModel");
// landpage box
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
        // Hashing the password for DB insertion
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        var newUser = new User({ username: req.body.username, email: req.body.email, password: hashedPassword });
        User.create(newUser).then(user => {
            console.log(user.username + " has been saved to DB");
            res.redirect("/")
        }).catch(err => {
            console.log(err);
            return res.redirect("/register");
        })
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
            res.send("Not Allowed, try again");
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