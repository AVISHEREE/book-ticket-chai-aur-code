## Book my Ticket
Hii, This is my project Book-my-ticket here I'll tell what process and steps i followed 
So ideally we have some a starter code now without changing it we need to write code 
and can add own functionality related to the project 

## Problem
The problem here is that anyone can book ticket without login so we need to solve the problem
and add our own authentication and authrorization so that first user authorize and then authenticate

## Dependensies
JWT (Json web token) // for making tokens of current user and using in cookiees
Bcrypt // for hashing password
Zod // for user validations 

## Flow
we first created the user table 
CREATE TABLE users ( id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255),  created_at TIMESTAMPTZ DEFAULT NOW() );

then we created the seats table
CREATE TABLE seats ( id SERIAL PRIMARY KEY, name VARCHAR(255), isbooked INT DEFAULT 0 );

then we generated the data for booking seats 
INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 20);

## Endpoints
/register -> for creating new user account
/login -> for authenticating the existing user and giving access

## auth middleare
create auth middleware where you add an authentication in your seat booking so that we make sure only authenticated user
can only book tickets 
Like this ->
PUT /1/Akash Authorization: Bearer <token>

## About
Akash Vyas an chai code cohort student 

The focus is not about UI or not about changing the existing code but building an authentication system on top of your code
for security in your application and registering user and login for user and also securing routes so that no else can book 
ticket outside your system

## File create
--> .env (to keep our tokens and password shhh secret)

