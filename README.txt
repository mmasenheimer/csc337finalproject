#  E-Commerce Book Store

## Authors
- **Michael Masenheimer**
- **Joe Grimes**
- **Kyle Vega**

---

## 📖 Overview
This is a Node.js web application built using **Express** and **MongoDB**.  
It uses **JavaScript** and **HTML/CSS** for the frontend and **JavaScript** for the backend.

## User Features ##
 
## 1.Account Creation
-Users may register by entering a name, email, and password.
-Duplicate emails are not allowed.
-New users are stored in the database.

## 2.Login
-Users log in using their email and password.
-If no record exists with matching credentials, an error is shown.

## 3.Browsing Books
-Logged-in users can view a list of all available books.
-Each book displays title, author, price, and cover image.

## 4.Shopping Cart
-Users can add books to their cart.
-Adding the same book increases the stored quantity.
-Quantities can be changed from the cart page.
-Users can remove items completely.
-Checkout clears the entire cart from the database.

All cart operations persist to MongoDB.

## Admin Features ##

Admin access is handled through a code-based system rather than separate accounts.
Users can access admin mode as follows:
## 1.Log in normally.
## 2.Navigate to the Home page.
## 3.Click "Admin" in the top-right navigation bar.
## 4.A dropdown appears prompting for an admin access code.
## 5.Enter the code: 3030
Follow the instructions below to install and set everything up:

install mongodb
install node





---

### The application will run on localhost 3030

Required dependencies:
Express
MongoDB
Multer

Run once in CL: npm install mongodb multer express