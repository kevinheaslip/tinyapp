// checks to see if an email already exists inside the users object
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return null;
};

// generates a random six character alphanumeric string
const generateRandomString = function() {
  return Math.random().toString(36).replace('0.', '').substring(0, 6);
};

// filters urlDatabase for urls with a userID that matches cookie userID
const urlsForUser = function(id, database) {
  const userUrls = {};
  for (const entry in database) {
    if (database[entry].userID === id) {
      userUrls[entry] = {
        longURL: database[entry].longURL,
      };
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };