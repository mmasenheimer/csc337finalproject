function attemptLogin(db, email, password) {
  return db.collection("users").findOne({ email: email, password: password });
}

//This function exists to get the most recent userID within the db. So creating new accounts will +1 the last entered
//sort by desc then grab first entry
async function getLastUserId(db){
  const users = await db.collection("users")
    .find({})
    .sort({ userId: -1 })
    .limit(1)
    .toArray();

  if (users.length === 0) {
    return 0;
  }
  console.log(users[0].userId)
  return users[0].userId;
}


async function checkForExisting(db, email){
  const user = await db.collection("users").findOne({email})
  if (user){
    return true
  }
  return false
}

async function createAccount(db, name, email, password){
  var new_id = await getLastUserId(db)
  new_id += 1

  const newUser = {
    //user name email password type
    userId : new_id,
    name: name,
    email: email,
    password: password,
    type : "guest"
  };
  try{
    const result = await db.collection("users").insertOne(newUser);
    console.log("User successfully created in database");
  }
  catch(err){
    console.log("Error with creation ", err)
  }
}

module.exports = { attemptLogin, checkForExisting, createAccount};
