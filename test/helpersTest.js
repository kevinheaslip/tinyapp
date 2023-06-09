const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.deepEqual(user, {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    });
  });
  it('should return null for a user with invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.strictEqual(user, null);
  });
});
