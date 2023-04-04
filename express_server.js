const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// generates a random six character alphanumeric string
const generateRandomString = function() {
  return Math.random().toString(36).replace('0.', '').substring(0, 6);
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
    username: req.cookies["username"]
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
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('urls');
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    urls: urlDatabase,
    username: req.cookies["username"]
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
