const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Import uuidv4
require("dotenv").config();
const bodyParser = require('body-parser');

const users = require('./models/users')

app.use(cors());
app.use(bodyParser.json());

mongoose
    .connect(
        process.env.MONGO_URI
    ).then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Connection failed!");
    });

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/users', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

        // Check if first name starts with a capital letter
        if (!firstName.match(/^[A-Z]/)) {
            return res.status(400).json({ statusCode: 400, message: 'First name should start with a capital letter' });
        }

        // Check if last name starts with a capital letter
        if (!lastName.match(/^[A-Z]/)) {
            return res.status(400).json({ statusCode: 400, message: 'Last name should start with a capital letter' });
        }

        // Check if mobile number is unique
        const existingUserWithPhoneNumber = await users.findOne({ phoneNumber });
        if (existingUserWithPhoneNumber) {
            return res.status(400).json({ statusCode: 400, message: 'Mobile number already exists' });
        }

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ statusCode: 400, message: 'Email already exists' });
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({ statusCode: 400, message: "Passwords don't match" });
        }
        
        // Generate UUID for user ID
        const userId = uuidv4().substr(0, 12).toUpperCase();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new users({
            userId,
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            confirmPassword:hashedPassword
        });

        // Save user to database
        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getusers', async (req, res) => {
    try {
        const userList = await users.find(); // Rename variable to userList
        res.status(200).json(userList);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Update a user

  // Update a user
  app.put('/api/users/:email', async (req, res) => {
    const { email } = req.params;
    const updatedUser = req.body;
  console.log(updatedUser)
    try {
      const user = await users.findOneAndUpdate({ email: email }, updatedUser, { new: true });
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
});


 
  app.delete('/api/users/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      await users.findOneAndDelete({ email: email }); // Assuming your collection is named 'users'
      res.sendStatus(204); // No Content
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
});


  

module.exports = app;
