// services/user.js

// Login with email + password
function attemptLogin(db, email, password) {
  return db.collection("users").findOne({ email: email, password: password });
}

// Get most recent userId
async function getLastUserId(db) {
  const users = await db
    .collection("users")
    .find({})
    .sort({ userId: -1 })
    .limit(1)
    .toArray();

  if (users.length === 0) {
    return 0;
  }
  console.log(users[0].userId);
  return users[0].userId;
}

async function checkForExisting(db, email) {
  const user = await db.collection("users").findOne({ email });
  return !!user;
}

async function createAccount(db, name, email, password) {
  let new_id = await getLastUserId(db);
  new_id += 1;

  const newUser = {
    userId: new_id,
    name: name,
    email: email,
    password: password,
    type: "guest",
  };

  try {
    await db.collection("users").insertOne(newUser);
    console.log("User successfully created in database");
  } catch (err) {
    console.log("Error with creation ", err);
  }
}

// ───── NEW FUNCTIONS FOR PROFILE PAGE ─────

// Get user by numeric userId
async function getUserById(db, userId) {
  return await db.collection("users").findOne({ userId: userId });
}

// Update email for userId
async function updateEmail(db, userId, newEmail) {
  // Optional: ensure email isn't already taken
  const existing = await db.collection("users").findOne({ email: newEmail });
  if (existing && existing.userId !== userId) {
    throw new Error("Email already in use");
  }

  const result = await db
    .collection("users")
    .updateOne({ userId: userId }, { $set: { email: newEmail } });

  if (result.matchedCount === 0) {
    throw new Error("User not found");
  }

  return true;
}

// Update password only if oldPassword matches
async function updatePassword(db, userId, oldPassword, newPassword) {
  const user = await db.collection("users").findOne({ userId: userId });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.password !== oldPassword) {
    throw new Error("Current password is incorrect");
  }

  await db
    .collection("users")
    .updateOne({ userId: userId }, { $set: { password: newPassword } });

  return true;
}

module.exports = {
  attemptLogin,
  checkForExisting,
  createAccount,
  getUserById,
  updateEmail,
  updatePassword,
};
