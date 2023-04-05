const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  '4lmtms': {
    id: "4lmtms",
    email: "steve@apple.com",
    password: "apple-iphone",
  },
  'w47m3j': {
    id: "w47m3j",
    email: "bill@microsoft.com",
    password: "windows-eight",
  },
};

// generates a random six character alphanumeric string
const generateRandomString = function() {
  return Math.random().toString(36).replace('0.', '').substring(0, 6);
};

// checks to see if an email already exists inside the users object
const userEmailCheck = function(email) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body); // log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post('/login', (req, res) => {
  res.redirect('urls');
});

app.post('/logout', (req, res) => {
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  // assign new user an id and store their information in an object in users
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password,
  };
  // sends 400 bad request if someone tries to register with blank email/password
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  // sends 400 bad request if someone tries to register with an email that is already registered
  if (userEmailCheck(req.body.email) !== null) {
    res.sendStatus(400);
  }

  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_register', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const updatedLongUrl = req.body.longURL;
  urlDatabase[req.params.id] = updatedLongUrl;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const longUrl = urlDatabase[req.params.id];
  res.redirect(longUrl);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
