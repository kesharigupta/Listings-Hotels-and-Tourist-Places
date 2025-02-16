const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PassportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
    email:{
        type: String,
        required: true
    }   
});

// automatic password type set kar dete hai jise @#$% te sb lagna 
userSchema.plugin(PassportLocalMongoose);

module.exports = mongoose.model("User" , userSchema);
