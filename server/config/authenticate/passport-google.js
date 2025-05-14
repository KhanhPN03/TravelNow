// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth2').Strategy;
// const authenticate = require('../authenticate')
// const User = require('../../models/Account');
// require('dotenv').config();
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:5000/auth/google/callback",
//     passReqToCallback: true
// }, 
// async (request, accessToken, refreshToken, profile, done) => {
//     try {   
//         let user = await User.findOne({ googleID: profile.id });
//         if (!user) {        
//             user = new User({
//                 googleID: profile.id,
//                 email: profile.emails[0].value,
//                 username: profile.displayName,
//                 firstname: profile.given_name,
//                 lastname: profile.family_name,
//                 DOB: "",
//                 image: profile.picture               
//             });
//             await user.save();      
//         }
//         return done(null, user);
//     } catch (err) {
//         return done(err, null);
//     }
// }))

// passport.serializeUser((user, done) => {
//     done(null, user);
// })

// passport.deserializeUser((user, done) => {
//     done(null, user);
// })