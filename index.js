import express from "express"
import bodyParser from "body-parser"
import session from "express-session";
import connectMongo from "connect-mongo";  //npm i connect-mongo@3
import {connection,user,PetDetail,Chat_Room} from "./database.js"
import bcrypt from "bcryptjs"
import { resolve } from "path";
import multer from 'multer';
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
const MongoStore = connectMongo(session)
const sessionStore = new MongoStore({
    mongooseConnection : connection,
    collection : 'sessions'
})
app.use(session({
    secret : "My Secret",
    resave : false,
    saveUninitialized : true,
    store : sessionStore,
    cookie : {
        maxAge : 15*1000*60*60*24   // 15 day in milisecond
    }
}))
app.get("/",async(req,res)=>{
    if(req.session.email){
        res.render("index.ejs",{flag:1});
    }
    else{
        res.render("index.ejs",{flag:0});
    }
})
app.get("/r",(req,res)=>{
    res.render("registration.ejs");
})

app.get("/l",(req,res)=>{
    res.render("login.ejs");
})
app.post("/registration",async(req,res)=>{
   try{
      if(req.body.password===req.body.ConfirmPassword){
          
          const salt = await bcrypt.genSalt(10);
          const hPassword = await bcrypt.hash(req.body.password,salt);
          const a = new user({
             name : req.body.name,
             email: req.body.email,
             password:hPassword
          });
          a.save();
          res.redirect("/l");
      }
      else{
        res.redirect("/r");
      }
   }
   catch(err){
      console.log(err.message);
      res.redirect("/r");
   }
})

app.post("/login",async(req,res)=>{
   try{
      const a = await user.findOne({email:req.body.email});
      if(a){
          const is_match = await bcrypt.compare(req.body.password,a.password);
          if(is_match){
              req.session.email = req.body.email;
              if(req.body.login_type==="Buyer"){
                res.redirect("/all_pet")
              }
              else{
                  res.redirect("/seller");
              }
          }
          else{
            res.redirect("l");
          }3
      }
      else{
        res.redirect("/r");
      }
   }
   catch(err){
      console.log(err.message);
      res.redirect("/l")
   }
})
app.get("/seller",async (req,res)=>{
     if(req.session.email){
        let arr = await PetDetail.find({email:req.session.email});
        res.render("seller_home.ejs",{arr:arr,flag:1});
     }
     else{
        let arr = [];
        res.render("seller_home.ejs",{arr:arr,flag:0});
     }
})
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


function toTitleCase(str) {
    // Split the string into an array of words
    const words = str.split(' ');
    // Capitalize the first letter of each word
    const titleCaseWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    // Join the words back together
    const titleCaseString = titleCaseWords.join(' ');
    return titleCaseString;
}
// Route to handle file upload and save to the database
app.post('/sell_pet', upload.single('img'), async (req, res) => {
  try {
    if(req.session.email){
        const email = req.session.email;
        const type = req.body.selectedOption;
        let x = await PetDetail.find({});
        let s = (x.length).toString();
        const id = x.length;
        const breed= toTitleCase(req.body.breed);
        const name = req.body.name.slice(0,1).toUpperCase()+req.body.name.slice(1,req.body.name.length);
        const gender = req.body.gender;
        const state = req.body.state.toUpperCase();
        const city =  req.body.city.slice(0,1).toUpperCase()+req.body.city.slice(1,req.body.city.length);
        const mobile_no = req.body.mobile_no;
        const about = req.body.about;
        const Orgfilename = req.file.originalname;
        let filename = Orgfilename;
        const data = req.file.buffer;

        // Save to the database
        const image = new PetDetail({id,type,breed,name,gender,state,city,mobile_no,email,about,filename,data});
        await image.save();
    }
    res.redirect("/seller");
  } catch (error) {
    console.error('Error saving to the database:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.post("/filter",async(req,res)=>{
    const type = req.body.selectedOption;
    const breed= toTitleCase(req.body.breed);
    const state = req.body.state.toUpperCase();
    const city =  req.body.city.slice(0,1).toUpperCase()+req.
    body.city.slice(1,req.body.city.length);
    let obj = {type:type};
    if(breed){
        obj["breed"] = breed;
    }
    if(state){
        obj["state"] = state;
    }
    if(city){
        obj["city"] = city
    }
    const arr = await PetDetail.find(obj);
    res.render("all_pet.ejs",{arr:arr,flag:0});
})

app.get("/chat/:from",async(req,res)=>{
    if(req.session.email){
        let mail_of_pet_owner = req.params.from;
        let user_ = await user.findOne({email:mail_of_pet_owner});
        let mail = req.session.email; 
        let arr1 = await Chat_Room.findOne({from:mail,to:mail_of_pet_owner});
        if(arr1)arr1 = arr1.messages;
        let arr2 = await Chat_Room.findOne({from:mail_of_pet_owner,to:mail});
        if(arr2)arr2 = arr2.messages;
        if(arr1){
        for(let i=0;i<arr1.length;i++){
            arr1[i]["a"] = 1;
        }
        }
        if(arr2){
            for(let i=0;i<arr2.length;i++){
                arr2[i]["a"] = 2;
            }
        }
        let arr = [];
        if(arr1){
            for(let i=0;i<arr1.length;i++){
                arr.push(arr1[i]);
            }
        }
        if(arr2){
            for(let i=0;i<arr2.length;i++){
                arr.push(arr2[i]);
            }
        }
        arr.sort((a, b) => a.timestamp - b.timestamp);
        // for(let i=0;i<arr.length;i++){
        //     if(arr[i]["a"]===1){
        //         console.log("wow")
        //     }
        //     else{
        //         console.log("wah")
        //     }
        // }
        res.render("chat.ejs",{pet_owner_mail:mail_of_pet_owner,arr:arr,name:user_.name});
    }
    else{
        res.redirect("/l");
    }
})

app.post("/chat",async(req,res)=>{
    if(req.session.email){
        let pet_owner_mail = req.body.pet_owner_mail;
        let mail = req.session.email ; 
        let msg = req.body.msg;
        let result = await Chat_Room.findOneAndUpdate(
            { from: mail, to: pet_owner_mail },
            {
                $push: {
                    messages: {
                        text: msg
                    }
                }
            },
            { upsert: true, new: true } // upsert: If the document doesn't exist, create it, new: Return the modified document
        );
        res.redirect("/chat/"+pet_owner_mail);
    }
    else{
        res.redirect("/l");
    }
})
app.get("/chat_",async(req,res)=>{
    if(req.session.email){
        let pet_owner_mail= req.session.email;
        let arr = await Chat_Room.find({to:pet_owner_mail}); 
        arr.sort((a, b) => {
            const lastMessageA = a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : 0;
            const lastMessageB = b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : 0;
        
            return lastMessageB - lastMessageA; // Sort in descending order
        });
        res.render("chat_container.ejs",{arr:arr});
    }
    else{
        res.redirect("/l");
    }
})
app.get("/all_pet",async(req,res)=>{
    let arr = await PetDetail.find({});
    if(req.session.email){res.render("all_pet.ejs",{arr:arr,flag:1});}
    else{res.render("all_pet.ejs",{arr:arr,flag:0});}
})

app.get("/product/:id",async(req,res)=>{
    let x = parseInt(req.params.id);
    let arr = await PetDetail.findOne({id:x});
    if(req.session.email){
        res.render("product_detail.ejs",{arr:arr,flag:1});
    }
    else{
        res.render("product_detail.ejs",{arr:arr,flag:0});
    }
})

app.post("/delete",async(req,res)=>{
    let id_ = req.body.id1;
    let arr = await PetDetail.deleteOne({id:id_});
    let x = await PetDetail.updateMany(
        {
            id : {$gt : id_}
        },
            { $inc: { id: -1 } },
    )
    res.redirect("/seller");
})
app.get("/logout",(req,res)=>{
    req.session.email = undefined;
    res.redirect("/");
})

app.listen(3000,()=>{
    console.log("Listening");
})