var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

//LOGIN POST ROUTE
router.post('/login', function (req, res, next) {
    console.log('Looking for user...'),
        console.log('Received ')
    models.emp.findOne({
        where: { userId: req.body.userId}
    }).then(userId => {
        if (!userId) {
            console.log('Invalid Login Attempt!')
            //res.render('badlogin');
            return
        } else {
            console.log('Checking Password...')
            let passwordMatch = authService
                // CHECK IF THE PASSWORD MATCHES
                .comparePassword(req.body.password, userId.password);
            console.log('Compared the Auth Passwords...')
            if (passwordMatch) {
                let token = authService.signUser(userId);
                res.cookie('jwt', token);
                // IS THE USERS ACCOUNT SET TO DELETED?
                console.log('Browser is a good boy, gave a cookie!')
                if (userId.deleted) {
                    res.cookie('jwt', '', { expires: new Date(0) });
                    res.render('deleted');
                    console.log('Account has been deleted...'),
                        console.log('Deleted Assigned Cookie and Logged User back out!');
                } else {
                    // IF USER ADMIN DIRECT TO ADMIN PAGE
                    if (userId.admin) {
                        console.log('REDIRECTING TO ADMIN PAGE....');
                        res.json({
                            logged_in_admin: true,
                            emp: emp,
                            jwt: token
                        })
                        console.log('Logged in as Admin!');
                    } else if (userId.manager) {
                        res.json({
                            logged_in_manager: true,
                            emp: userId,
                            jwt: token
                        })
                        console.log('Logged in as User');
                        console.log('REDIRECTIONG TO MANAGER PAGE....');
                    } else { 

                        models.schedules.findAll({
                            where: { idemp: userId.idemp}
                        }).then(idemp => {

                        // IF USER NOT ADMIN OR MANAGER, DIRECT TO PROFILE
                        res.json({
                            logged_in: true,
                            emp: userId,
                            jwt: token,
                            idemp: idemp
                        })
                        })
                        console.log('Logged in as User');
                    }
                };
            } else {
                console.log("Invalid Credentials!");
            };
        };
    });
});

//LOGIN GET ROUTE
router.get('/login', function (req, res, next) {
    res.send(JSON.stringify(
        models.emp
    ));
});

//USER LISTING ROUTE
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//SIGNUP GET ROUTE
router.get('/signup', function (req, res, next) {
    res.render('signup');
});

//SIGNUP POST ROUTE
router.post('/signup', function (req, res, next) {

    console.log('Checking Account Creation Requirements....')
    models.emp
        .findOrCreate({
            where: { userId: req.body.userId },
            defaults: {
                hireDate: req.body.hireDate,
                dob: req.body.dob,
                firstName: req.body.firstName,
                middleName: req.body.middleName,
                lastName: req.body.lastName,
                userId: req.body.userId,
                password: authService.hashPassword(req.body.password),
                active: req.body.active
            }
        })
        .spread(function (result, created) {
            if (created) {
                console.log('User Successfully Created!');
            } else {
                res.send('User Name Does Not Meet The Requirements!');
            }
        });
});

//ADMIN GET ROUTE
// router.get('/admin', function (req, res, next) {
//     let token = req.cookies.jwt;
//     if (token) {
//       authService.verifyUser(token)
//         .then(user => {
//           if (user.admin) {
//             models.users.findAll({
//               where: {
//                 Deleted: false
//               }
//             }).then(usersFound => {
//               if (usersFound) {
//                 console.log('FOUND USERS TO LIST....');
//                 res.render('admin', {
//                   firstName: user.firstName,
//                   lastName: user.lastName,
//                   username: user.username,
//                   email: user.email,
//                   list: usersFound,
//                 })
//               } else {
//                 res.send('Something Went Wrong!');
//               }
//             })
//           } else {
//             res.redirect('profile');
//           }
//         });
//     } else {
//       res.status(401);
//       res.send('Must be logged in');
//     }

//   });

//LOGOUT GET ROUTE
router.get('/logout', function (req, res, next) {
    console.log('Logging User Out....');
    res.cookie('jwt', '', { expires: new Date(0) });
    console.log('User is Now Logged Out....');
    res.redirect('/users/login');
    console.log('Logging User Out....');
    res.cookie('jwt', '', { expires: new Date(0) });
    console.log('User is Now Logged Out....');
    res.redirect('/users/login');
});

router.post('/schedule', function (req, res, next) {

});

module.exports = router;
