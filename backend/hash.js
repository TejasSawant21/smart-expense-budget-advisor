const bcrypt = require("bcryptjs");

const password = "admin21";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Hashed password:");
    console.log(hash);
  }
});
