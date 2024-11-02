const mongoose = require('mongoose');
const {Schema,model} = mongoose;


const userSchema = new Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    Username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

const User = model('User', userSchema);

module.exports = User;
