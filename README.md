## Book my Ticket
Hii, This is my assignment Book-my-ticket where I want to make an authentication system and  a look on seat booking logic <br>
the main work is build an authentication system above an existing system without breaking the seat booking logic and <br>
adding an authentication middleware so we have some a starter code now without changing it we need to write code 

## Problem
The problem here is that anyone can book ticket without login so logged in users can only book seats for a movie <br> 
so we need to solve the problem and add our own authentication and authrorization so that first user authorize and then authenticate

## Dependensies
JWT (Json web token) // for making tokens of current user and using in cookiees <br>
Bcrypt // for hashing password <br>
Zod // for user schema validations <br>

## Flow
we first created the user table so that the main problem is solved <br>
CREATE TABLE users ( id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255),  created_at TIMESTAMPTZ DEFAULT NOW() ); <br>

then we created the seats table <br>
CREATE TABLE seats ( id SERIAL PRIMARY KEY, name VARCHAR(255), isbooked INT DEFAULT 0 ); <br>

then we generated the data for booking seats <br>
INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 20); <br>

## Endpoints & Flow
/register -> for creating new user account <br>
Step 1 : get all data in body from API req <br>
Setp 2 : verified the data from zod UserSchema <br>
Step 3 : check if the email is already exist with the SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) query so it will search fastly and stop if found at once <br>
Step 4 : hashed the password to store it securely with the secret key and with the help of the bcryptjs lib <br>
Step 5 : inserted the user into database memory with the insert query <br>
Step 6 : return the result not password and status 201 because it's a post in json with a <br>
message : Registration sucessfull

/login -> for authenticating the existing user and giving access <br>
Step 1 : get all data in body from API req <br>
Setp 2 : verified the data from zod UserSchema <br>
Step 3 : check if the user is authenticated SELECT id, name, email, password FROM users WHERE email = $1 <br>
Step 4 : check the password with the db password and user given passowrd and comparing and checking if the password is correct or not <br>
Step 5 : sign the JWT like make a token with the user credentials to use in authMiddleware for token bearer <br>
Step 6 : return user details and also token with a message <br>

## auth middleare
create auth middleware where you add an authentication in your seat booking so that we make sure only authenticated user can only book tickets <br>
Like this -> <br>
PUT /1/Akash Authorization: Bearer <token> <br>

### flow for auth 
Step 1 : check if the headers have authorization key value pair if yess go ahead if no deny accesss <br>
Step 2 : take the token from split because headers will come in the format Bearer <token> <br>
Step 3 : verify the token with the secret <br>
Step 4 : if everything good run the next() function and give access <br>
Step 5 : if not verified deny to access <br>


## About
Akash Vyas a chai code cohort student 

The focus is not about UI or not about changing the existing code but building an authentication system on top of your code <br>
for security in your application and registering user and login for user and also securing routes so that no else can book <br>
ticket outside your system

## File create
--> .env (to keep our tokens and password shhh secret) <br>

