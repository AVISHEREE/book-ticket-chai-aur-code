//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import "dotenv/config"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import z from "zod"


const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

const userSchema = z.object({
  name:z.string(),
  email:z.string(),
  password:z.string(),
})


// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,//use neon db connection string here
  ssl: {
    rejectUnauthorized: false,
  },
});

const registerUserController = async (req,res) =>{
  try {
    const user = userSchema.parse(req.body)
    
    const existingUser = await pool.query("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)",[user.email]);
    
    if(existingUser.rows[0].exists){
      return res.status(400).json({error:"user is already exists"});
    }

    const hashedPassword = await bcrypt.hash(user.password,5);

    const result = await pool.query(
      "INSERT INTO users(name,email,password) VALUES ($1 , $2 , $3 ) RETURNING id , name , email",
      [user.name,user.email,hashedPassword]
    );
    res.status(201).json({message:"Registered Successfully",user:result.rows[0]})

  } catch (error) {
    if (error instanceof z.ZodError) {
    return res.status(400).json(error.format()); 
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

const loginUserController = async (req,res) =>{
  try {
    const loginSchema = userSchema.pick({ 
      email: true, 
      password: true 
    });
    const {email,password} = loginSchema.parse(req.body);
    
    const result = await pool.query("SELECT id, name, email, password FROM users WHERE email = $1",[email]);
    if(result.rows[0].length === 0){
      return res.status(401).json({error:"Email not resgistered"});
    }
  
    const user = result.rows[0];
    const passwordCheck = await bcrypt.compare(password,user.password);
    if(!passwordCheck){
      return res.status(401).json({error:"Password is not correct"});
    }
  
    const token = jwt.sign({id:user.id,email:user.email,name:user.name},process.env.JWT_SECRET,{expiresIn:"1d"})
  
    res.json({
      message:"Logged in successfully",
      token,
      user:{id:user.id,email:user.email,name:user.name}
    })
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error while login" });
  }

}

const authMiddleware = (req,res,next)=>{
  const authHeader = req.headers["authorization"]
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied no token provided" });
  }

  const token = authHeader.split(" ")[1];

  if(!token){
    return res.status(401).json({ error: "Access denied token not provided" });
  }

  const decoded = jwt.verify(token,process.env.JWT_SECRET)
  req.user = decoded
  next();
}


const app = new express();
app.use(cors());
app.use(express.json())
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

//register user 
app.post('/register',registerUserController);

//login user
app.post('/login',loginUserController)

//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

//book a seat give the seatId and your name

app.put("/:id/:name",authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      res.send({ error: "Seat already booked" });
      return;
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    res.send(500);
  }
});

app.listen(port, () => console.log("Server starting on port: " + port));
