import bcrypt from "bcryptjs";
const password = "demo123";
const saltRounds = 12;
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log("Your new password hash is:");
  console.log(hash);
});
