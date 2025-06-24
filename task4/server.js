const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vehicles')
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Connection error', err));

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// --- Auth Routes ---

// Registration form
app.get('/register', (req, res) => {
  res.render('register', { message: req.flash('error') });
});

// Handle registration
app.post('/register', async (req, res) => {
  try {
    const { username, password, email, age } = req.body;
    const user = new User({ username, password, email, age });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Registration failed. Username or email may already be taken.');
    res.redirect('/register');
  }
});

// Login form
app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

// Handle login
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/vehicles',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

// --- Vehicle CRUD Routes (protected) ---

app.get('/vehicles', ensureAuthenticated, async (req, res) => {
  const vehicles = await Vehicle.find({});
  res.render('index', { vehicles, user: req.user });
});

app.post('/vehicles', ensureAuthenticated, async (req, res) => {
  const newVehicle = new Vehicle(req.body);
  await newVehicle.save();
  res.redirect('/vehicles');
});

app.get('/vehicles/:id/edit', ensureAuthenticated, async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  res.render('edit', { vehicle, user: req.user });
});

app.put('/vehicles/:id', ensureAuthenticated, async (req, res) => {
  await Vehicle.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/vehicles');
});

app.delete('/vehicles/:id', ensureAuthenticated, async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.redirect('/vehicles');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));