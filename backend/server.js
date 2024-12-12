import express from "express";
import pg from  "pg";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

const app=express();
const port=4000;
const saltingRound=10;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

const db=new pg.Client({

    user:"postgres",
    host:"localhost",
    database:"dbproject",
    password:"123",
    port:5432
 
 });
 
 db.connect();

app.post("/update/:id",async (req,res)=>{
     
  const id=req.params.id;

  console.log("id:"+id);
  console.log(req.body);
  const {user_id,name,surname,gender,birthdate}=req.body;

  try {

    await db.query("update users set user_id=$1,name=$2,surname=$3,gender=$4,birthdate=$5 where user_id=$6",[user_id,name,surname,gender,birthdate,id]);
    
    res.json("updating user successful");
    console.log("updating user successful");
    
  } catch (error) {

    console.log("updating user failed");
    console.log(error);
    res.json(error);
    
  }


})
app.post("/add/skill/",async (req,res)=>{
     
  const {username,skill_id,type} =req.body;
 
  try {

    if(type==="has"){
      
      await db.query("insert into has values($1,$2)",[username,skill_id]);
  
    }
    else{
  
      await db.query("insert into needs values($1,$2)",[username,skill_id]);
    }
    
    console.log("adding skill successful");
    res.json("adding skill successful");
    
  } catch (error) {
    
    console.log("adding skills failed");
    res.json(error);
  }


  


});
 
app.get("/skills",async (req,res)=>{
    
 const result =  await db.query("select * from skills");
 
 const data=result.rows;

 res.json(data);


})
app.get("/user/:id",async (req,res)=>{

  const id=req.params.id;


  
 const result =  await db.query("select * from Users where user_id=$1",[id]);
 const followers=await db.query("select * from get_followers($1)",[id]);
 const followings = await db.query("select * from get_followings($1)",[id]);
 const hasSkills=await db.query("select * from get_user_skills($1)",[id]);
 const needSkills=await db.query("select * from get_user_skills_needs($1)",[id]);
 console.log(result.rows);
 const userInfo={

  profile:result.rows[0],
  followers:followers.rows,
  followings:followings.rows,
  hasSkills:hasSkills.rows,
  needSkills:needSkills.rows

 }

   res.json(userInfo);
})

app.get("/user/followers/:id",async (req,res)=>{

  const id=req.params.id;
  const followers=await db.query("select * from get_followers($1)",[id]);

  res.json(followers.rows);

})

app.get("/user/followings/:id",async (req,res)=>{

  const id=req.params.id;
  const followings = await db.query("select * from get_followings($1)",[id]);

  res.json(followings.rows);

})

app.get("/user/has/:id",async (req,res)=>{

  const id=req.params.id;
  const hasSkills=await db.query("select * from get_user_skills($1)",[id]);

  res.json(hasSkills.rows);

})

app.get("/user/needs/:id",async (req,res)=>{

  const id=req.params.id;
  const needSkills=await db.query("select * from get_user_skills_needs($1)",[id]);
  
  console.log("id= "+id);
  console.log(needSkills.rows);
  res.json(needSkills.rows);

})



app.post("/signup",async (req,res)=>{

   const {username,password,name,surname,gender,date}=req.body;
   
    const point=0;

     bcrypt.hash(password,saltingRound,async (err,hash)=>{

      if(err){

        console.log("error during hashing");
      }
      else{
         
        
        try {
          const result=  await db.query("insert into Users values($1,$2,$3,$4,$5,$6,$7);",[username,name,surname,gender,date,point,hash]);
          res.json("inserting succeeded");
          
        } catch (error) {

          res.json("inserting failed");
          
        }
      }


    })

}
);

app.post("/login",async (req,res)=>{
   
  const {username,password}=req.body;

  try {

    const result= await db.query("select password from Users where user_id=$1",[username]);
   
    if(result.rows.length==0){

    res.json("No such user");
    console.log("no such user");
  }
  else{

    bcrypt.compare(password,result.rows[0].password,(err,result)=>{

      if(err){
        
        res.json("Error comparing passwords");
        console.log("error comparing passwords");
      }
      else{

        if(result){
          res.json("Successful login");
          console.log("successful login")
        }
        else{
          res.json("Incorrect password");
          console.log("incorrect password")
        }
      }
    })
  }
    
  } catch (error) {
    res.json(error);
  }

  


});

app.post("/remove",async (req,res)=>{

   const {user,userToRemove,removeFrom}=req.body;

   try {
    
    if(removeFrom==="following"){

      await db.query("delete from follows where Follower_ID=$1 and Followed_ID=$2",[user,userToRemove]);
     }
     else{
        
      await db.query("delete from follows where Follower_ID=$1 and Followed_ID=$2",[userToRemove,user]);
  
  
     }
     
     console.log("removed successful");
     res.json("removed successful");

   } catch (error) {
    
    res.json(error);
   }

  

   

})

app.listen(port,()=>{

    console.log("server listening on port "+port);
  
});


