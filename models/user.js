const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  profileimage: {
    type: String,
  },
});

UserSchema.statics.createUser = async (newUser) => {
  newUser.password = await bcrypt.hash(newUser.password, 8);
  await newUser.save();
  // ここででたErrorは呼び出し元ルーチンに伝播する。
  // いづれにしても try{} catch {} する。
};

UserSchema.statics.getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    console.log("getUserById: User not find %s", id);
    throw new Error("User not find");
  }
  return user;
};

UserSchema.statics.getUserByUsername = async (username) => {
  var query = { username: username };
  const user = await User.findOne(query);
  if (!user) {
    console.log("getUserByUserName: User not find");
    throw new Error("User not find");
  }
  return user;
};

UserSchema.statics.comparePassword = async (candidatePassword, hash) => {
  console.log("comparePassword: %s@%s", candidatePassword, hash);
  const isMatch = await bcrypt.compare(candidatePassword, hash);
  if (!isMatch) {
    console.log("comparePassword: Password is not match");
    throw new Error("Unable to login");
  }
  return isMatch;
};

UserSchema.statics.findByCredentials = async (username, password) => {
  var query = { username: username };
  const user = await User.findOne(query);
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

/*
UserSchema.pre("save", function (next) {
  const user = this;

  bcrypt.hash(user.password, 10, function (error, encrypted) {
    user.password = encrypted;
    next();
  });
});
*/

const User = mongoose.model("User", UserSchema);
module.exports = User;
