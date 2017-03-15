const express = require('express');
const { client } = require('./cache/redis.js')
// const mongoose = require('mongoose');
// const User = require('./models/users');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const FB = require('./config/fb');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const Pusher = require('pusher')
const { pusher } = require('./pusher_secrets.js')

const server = require('http').Server(app);
const io = require('socket.io')(server);




const port = process.env.PORT || 8000;
// mongoose.connect('mongodb://localhost/snazr');

// passport.use( new FacebookStrategy( {
//   clientID: FB.FACEBOOK_APP_ID,
//   clientSecret: FB.FACEBOOK_APP_SECRET,
//   callbackUrl: FB.callbackUrl
// }, (accessToken, refreshToken, profile, done) => {
//   User.findOrCreate({id: profile.id }, (err, user) => {
//     if (err) {
//       return done(err);
//     } else {
//       done (null, user);
//     }
//   });
// }));

app.use(bodyParser.json());
//serve up public folder on endpoint '/'
app.use(express.static(path.join(__dirname, '../public')));
//serve up bundles folder on endpoint '/bundles'
app.use('/bundles', express.static(path.join(__dirname, '/../bundles')));

app.get('/api/test', function (req, res, next){
  res.send('what the fuck is up');
});

app.get('/api/toggled_users', function(req, res){
  //should send a list of all the users that have their discoverability toggled on
  //with x, y amount of range in terms of longitude & latitude
  //by retrieving the information from our cache
  // the information of location is sent through their locations
  // if there are no locations just give a generic guy called joe back
  // 
  
  let data = req.query //should hold the data
  console.log('weve made a request', data)
  client.util.get(data, client , 0.02)  //specify range here, 0.02 means within 2kilometer
  // .then(result => res.send(result))
  // res.send('GET RID OF THIS LINE')
})

app.post('/api/toggled_users', function(req, res){
  let user = req.body
  client.util.add(user, client);
  res.send('sent /api/toggled_users and adding')
})

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });

  socket.on('request connection', data => {
    let { userId, requestId } = data
    socket.emit('set private channel', 'dick')
    console.log(userId, requestId)
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
      


app.get('/joined', function(req, res){
  pusher.trigger('my-channel', 'my-event', {
    message: "hello world",
    location : {
      longitude: 123.11,
      latitude: 64.33
    }
  });

  pusher.trigger('4chan', 'my-event', {
    message: 'YOU"VE SEEN SOMETHING YOU SHOULDN"T HAVE'
  })
  res.send('ok')
})




server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});

