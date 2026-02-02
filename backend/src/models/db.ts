import mongoose,{model,Schema, Types} from "mongoose";


const UserSchema=new Schema({
    username:{type:String,unique:true},
    email: { type: String, required: true, unique: true },
    password:String
});

const ContentSchema=new Schema({
    title:String,
    link:String,
    tags:[{type:mongoose.Types.ObjectId, ref:'Tag'}],
    type: String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
    
});
const LinksSchema=new Schema({
    hash:String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true,unique:true},
})
export const LinkModel=model("Links",LinksSchema);
export const UserModel=model("User",UserSchema);
export const ContentModel=model("Content",ContentSchema);