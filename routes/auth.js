var express = require("express");
var router = express.Router();
// const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

/**
 * API for registering users to the website. Takes the following parameters (in body):
 * username - string
 *  first_name - string
 * last_name - string
 * country - string
 * password - string
 * email - string
 *  */ 
router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
    }

    // Checks if username is unique
    let users = [];
    users = await DButils.execQuery("SELECT username from users");
    if (users.find((x) => x.username === user_details.username))
      throw { status: 409, message: "Username taken" };

    // add the new username
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    await DButils.execQuery(
      `INSERT INTO users (username, first_name, last_name, country, password, email) VALUES ('${user_details.username}', '${user_details.first_name}', '${user_details.last_name}',
      '${user_details.country}', '${hash_password}', '${user_details.email}')`
    );
    res.status(200).send({ message: "user created", success: true });
  } catch (error) {
    res.status(400).send({ success: false, message: "This Username is already taken"});
  }
});

/**
 * API for logging in users. Takes the following parameters (in body):
 * username - string
 * password - string
 */
router.post("/Login", async (req, res, next) => {
  try {

    // Checks if you are already connected
    if (req.session && req.session.user_id)
    {
      res.send({ success: false, status: 201, message: "You can't login because there is already a connected user"});
      return;
    }

    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;
    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

// API that logout a connected user
router.post("/Logout", async (req, res) => {

  try 
    {
      // Checks that there is user connected
      if (req.session && req.session.user_id)
      {
        const users = await DButils.execQuery("SELECT user_id FROM users")
          if (users.find((x) => x.user_id === req.session.user_id)) 
          {
            req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
            res.status(200).send({ success: true, message: "logout succeeded" });
          }
      }
      else
      {
        res.status(201).send({ success: false, message: "You can't logout because there is no user logged in"});
      }

    }
    catch (error)
    {
      res.status(400).send({ success: false, message: "An error occured during logout"});
    }
});

module.exports = router;