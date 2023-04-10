const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret', 'keys'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {};
const users = {};

// generates a random six character alphanumeric string
const generateRandomString = function() {
  return Math.random().toString(36).replace('0.', '').substring(0, 6);
};

// checks to see if an email already exists inside the users object
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return null;
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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  // user must be logged in to view urls
  if (!req.session.user_id) {
    res.status(403).send('Must be registered/logged in to view tinyURLs!');
    return;
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  // user must be logged in to create new tinyURLs
  if (!req.session.user_id) {
    res.status(403).send('Must be registered/logged in to create a new tinyURL!');
    return;
  }
  console.log(req.body); // log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${id}`);
});

app.post('/login', (req, res) => {
  // look up email address submitted in login form in user object
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send('Invalid credentials!');
  }
  const user = getUserByEmail(req.body.email, users);
  // if the submitted password matches the user password in the database, set a cookie with the user ID
  if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session["user_id"] = user.id;
  } else {
    res.status(403).send('Invalid credentials!');
  }
  res.redirect('urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  // sends 400 bad request if someone tries to register with blank email/password
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  // sends 400 bad request if someone tries to register with an email that is already registered
  if (getUserByEmail(req.body.email, users) !== null) {
    res.sendStatus(400);
  }
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  // assign new user an id and store their information in an object in users
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hashedPassword,
  };
  req.session["user_id"] = userId;
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  // if the user is not logged in, redirect them to /login
  if (!templateVars.user) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  // if the user is logged in, redirect them to /urls
  if (templateVars.user) {
    res.redirect('/urls');
  }
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id],
  };
  // if the user is logged in, redirect them to /urls
  if (templateVars.user) {
    res.redirect('/urls');
  }
  res.render('urls_login', templateVars);
});

app.get('/urls/:id', (req, res) => {
  // user must be logged in to view urls
  if (!req.session.user_id) {
    res.status(403).send('Must be registered/logged in to view tinyURLs!');
    return;
  }
  // user can only view their own urls
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send('This tinyURL does not belong to you!');
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  // id does not exist
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('Sorry, that tinyURL doesn\'t exist!');
    return;
  }
  // user must be logged in to modify urls
  if (!req.session.user_id) {
    res.status(403).send('Must be registered/logged in to modify tinyURLs!');
    return;
  }
  // user can only modify their own urls
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send('This tinyURL does not belong to you!');
    return;
  }
  const updatedLongUrl = req.body.longURL;
  urlDatabase[req.params.id].longURL = updatedLongUrl;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  // id does not exist
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('Sorry, that tinyURL doesn\'t exist!');
    return;
  }
  // user must be logged in to modify urls
  if (!req.session.user_id) {
    res.status(403).send('Must be registered/logged in to modify tinyURLs!');
    return;
  }
  // user can only modify their own urls
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send('This tinyURL does not belong to you!');
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const longUrl = urlDatabase[req.params.id].longURL;
  // notify the user if a requested ID is not in the database
  if (!longUrl) {
    res.status(404).send('Sorry, that tinyURL doesn\'t exist!');
  }
  res.redirect(longUrl);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
