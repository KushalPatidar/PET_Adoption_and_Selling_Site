import mongoose from "mongoose";
mongoose.connect("mongodb://127.0.0.1:27017/PET");
export const connection = mongoose.connection;
const UserSchema = new mongoose.Schema({
    name : String,
    email:{
        type:String,
        unique:true
    },
    password:String
})
const PetDetailSchema = new mongoose.Schema({
    id:Number,
    type:String,
    name:String,
    gender:String,
    breed:String,
    state : String ,
    city : String,
    mobile_no : String,
    email:String,
    about : String,
    filename: String,
    data: Buffer
})

const Chat_RoomSchema = new mongoose.Schema({
    from : String,
    to:String,
    messages: [
        {
            text: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
})


export const user = mongoose.model("user",UserSchema);
export const Chat_Room = mongoose.model("Chat_Room",Chat_RoomSchema);
export const PetDetail = mongoose.model("PetDetail",PetDetailSchema);
