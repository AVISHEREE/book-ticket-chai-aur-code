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
we first created the user table so that the main problem is solved
CREATE TABLE users ( id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255),  created_at TIMESTAMPTZ DEFAULT NOW() );

then we created the seats table
CREATE TABLE seats ( id SERIAL PRIMARY KEY, name VARCHAR(255), isbooked INT DEFAULT 0 );

then we generated the data for booking seats 
INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 20);

## Endpoints & Flow
/register -> for creating new user account
Step 1 : get all data in body from API req
Setp 2 : verified the data from zod UserSchema
Step 3 : check if the email is already exist with the SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) query so it will search fastly and stop if found at once
Step 4 : hashed the password to store it securely with the secret key and with the help of the bcryptjs lib
Step 5 : inserted the user into database memory with the insert query 
Step 6 : return the result not password and status 201 because it's a post in json with a 
message : Registration sucessfull

/login -> for authenticating the existing user and giving access
Step 1 : get all data in body from API req
Setp 2 : verified the data from zod UserSchema
Step 3 : check if the user is authenticated SELECT id, name, email, password FROM users WHERE email = $1
Step 4 : check the password with the db password and user given passowrd and comparing and checking if the password is correct or not
Step 5 : sign the JWT like make a token with the user credentials to use in authMiddleware for token bearer  
Step 6 : return user details and also token with a message 

## auth middleare
create auth middleware where you add an authentication in your seat booking so that we make sure only authenticated user can only book tickets 
Like this ->
PUT /1/Akash Authorization: Bearer <token>

### flow for auth
Step 1 : check if the headers have authorization key value pair if yess go ahead if no deny accesss
Step 2 : take the token from split because headers will come in the format Bearer <token>
Step 3 : verify the token with the secret 
Step 4 : if everything good run the next() function and give access 
Step 5 : if not verified deny to access 


## About
Akash Vyas a chai code cohort student 

The focus is not about UI or not about changing the existing code but building an authentication system on top of your code
for security in your application and registering user and login for user and also securing routes so that no else can book 
ticket outside your system

## File create
--> .env (to keep our tokens and password shhh secret)

