function attemptLogin(db, email, password) {
  return db.collection("users").findOne({ email: email, password: password });
}

// function createAccount(name, username, password){

// }

module.exports = { attemptLogin };
