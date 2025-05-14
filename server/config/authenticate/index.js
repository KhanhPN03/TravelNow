const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/Account');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'email',
    usernameQueryFields: ['email']
  }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = (user) => {    
    return jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: 3600
    }) // get token
}

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY
}

exports.jwtPassport = passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload._id);
        if(user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

exports.verifyUser = passport.authenticate('jwt', {session: false}); // thông tin đc lưu trữ dạng token không cần lưu trữ trên server
