const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('../libs/generatePasswordLib')
const token = require('../libs/tokenLib')
const AuthModel = mongoose.model('Auth')
const nodemailer = require('../libs/nodemailer')

/* Models */
const UserModel = mongoose.model('User')
const FriendRequestModel = mongoose.model('FriendRequest')


// start user signup function 

let signUpFunction = (req, res) => {
    //check if correct values are given
    //generate hash for password
    //save data
    //send succcess or error
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.emailId) {
                if (!validateInput.Email(req.body.emailId)) {
                    let apiResponse = response.generate(true, 'Email does not met the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'Password parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createUser = () => {

        return new Promise((resolve, reject) => {
            UserModel.findOne({ emailId: req.body.emailId })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body);
                        //create new user
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            emailId: req.body.emailId.toLowerCase(),
                            countryCode: req.body.countryCode,
                            phoneNumber: req.body.phoneNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        });
                        //save new user
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        });

                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        });

    }//end create user

    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })


}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {
    //check if user exists
    //check if password matched
    //send success or error
    console.log("login function");
    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.emailId) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ emailId: req.body.emailId }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"emailId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    // validate if password input by user is correct or not
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword" + retrievedUserDetails);
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    // if passsword is correct we will generate authToken
    // authToken takes userdetails userId, firstName , lastName, countryCode, phoneNumber,emailId
    let generateToken = (userDetails) => {
        console.log("generate token");
        console.log(" user details to be saved in token are " + JSON.stringify(userDetails));
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    // if auth token doesn't exist make a new one and save it
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve);
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}

// end of the login function 


let logout = (req, res) => {

} // end of the logout function.

let forgotPassword = (req, res) => {
    //ccheck if email id is valid
    //check if email id exists or not 
    //if exists send move further, if not error
    //generate change password token as you generate auth token
    //send mail to email id
    //send success or error message


    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.emailId) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ emailId: req.body.emailId }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: forgotpassword()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: forgotPassword()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: forgotpassword()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        });
    }

    // here we generate new token for pasword change only 
    // this token would be used in change password situation
    let generateTokenToChangePassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateTokenForPasswordChange(userDetails.emailId, (err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: generateTokenToChangePassword', 10);
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null);
                    reject(apiResponse);
                } else {
                    let receiverDetails = {
                        emailId: userDetails.emailId,
                        token: result.token
                    }
                    nodemailer.sendMail(receiverDetails, (err, result) => {
                        console.log("generate token " + err + " " + result);

                        if (err) {
                            let apiResponse = response.generate(true, err.message, 500, null);
                            reject(apiResponse);
                        } else {
                            let apiResponse = response.generate(false, "Mail Sent." + result, 200, null);
                            resolve(apiResponse);
                        }
                    });

                }
            });
        });
    }

    findUser(req, res)
        .then(generateTokenToChangePassword)
        .then((resolve) => {
            res.send(resolve);
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })




} // end of the forgot password function.

let sendContactInfo = (req, res) => {

    let checkHiddenField = () => {
        console.log("hidden Field");
        return new Promise((resolve, reject) => {
            let hiddenField = req.body.hiddenField;
            if (!check.isEmpty(hiddenField)) {
                logger.error('Spam attempt as hidden field is filled', 'userController: send contact info()', 10)
                let apiResponse = response.generate(true, "Message not send", 500, null);
                reject(apiResponse);
            } else {
                resolve();
            }
        });
    }

    let sendContactInfoMail = () =>{
        return new Promise((resolve, reject) => {
            let senderDetails = {
                emailId: req.body.emailId,
                message: req.body.message,
            }
            nodemailer.sendContactInfo(senderDetails, (err, result) => {
              
                if (err) {
                    let apiResponse = response.generate(true, err, 500, null);
                    reject(apiResponse);
                } else {
                    let apiResponse = response.generate(false, "Mail Sent." + result, 200, null);
                    resolve(apiResponse);
                }
            });
        
        });
    
    }

    checkHiddenField(req, res)
    .then(sendContactInfo)
    .then((resolve) => {
        res.send(resolve);
    })
    .catch((err) => {
        console.log("errorhandler");
        console.log(err);
        res.send(err)
    })
  
} // end of the send Contact function.

let changePassword = (req, res) => {
    //see if token is valid
    //if valid token then extract email id from it
    // edit password for that email id
    // send success or fail

    verifyToken = (req, res) => {
        return new Promise((resolve, reject) => {
            console.log("verify token  called");
            if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
                let tokenFromRequest = req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken');
                // let apiResponse = response.generate(false, "Token is " + tokenFromRequest + "password is " +req.body.password, 400, null)
                //res.send(apiResponse);
                token.verifyClaimWithoutSecret(tokenFromRequest, (err, data) => {
                    if (err) {
                        let apiResponse = response.generate(false, "Token Error : " + err,
                            500, null)
                        reject(apiResponse);
                    } else {
                        //this data.data is emailId
                        resolve(data.data);
                    }
                })

            }
        });

    }

    changePassword = (emailId) => {
        return new Promise((resolve, reject) => {
            console.log("change password called for " + emailId);
            if (req.params.password || req.query.password || req.body.password || req.header('password')) {
                let passwordFromRequest = req.body.password;
                let options = { password: passwordLib.hashpassword(passwordFromRequest) };
                UserModel.update({ 'emailId': emailId }, options).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller:change password', 10)
                        let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
                        reject(apiResponse);
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller: change password');
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse);
                    } else {
                        //let apiResponse = response.generate(false, "Password Changed to: " + passwordFromRequest + " for " + email, 200, null)
                        let apiResponse = response.generate(false, "Password Changed For " + emailId, 200, null)
                        resolve(apiResponse);
                    }
                });// end user model update

            } else {
                let apiResponse = response.generate(true, "Empty or Invalid Passowrd " + passwordFromRequest, 400, null)
                reject(apiResponse);
            }
        });
    }

    verifyToken(req, res)
        .then(changePassword)
        .then((resolve) => {
            res.send(resolve);
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })


}//end change password function

/* Get all user Details */
let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users

// add to friend request
let addToFriendRequest = (req, res) => {
    //need both sender id and receiver id
    //status is set to 1
    //if positive result then we send a message to receiver side from front end
    // let senderId = req.body.senderId;
    // let receiverId = req.body.receiverId;
    // let status = req.body.status;
    console.log(req.body);
    let originName = "user controller : add to freind request";
    let validateParams = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(req.body.senderId) || check.isEmpty(req.body.receiverId)) {
                logger.info('parameters missing', originName, 9)
                let apiResponse = response.generate(true, 'User Id Missing', 403, null)
                reject(apiResponse);
            } else {
                resolve();
            }
        })
    } // end of the validateParams function.

    //first check if both user IDs from request are 
    //already sender & receiver or receiver & sender
    //if yes then throw error that friend request already exist
    //if no make one
    let checkIfFriendRequest = (senderId, receiverId) => {
        return new Promise((resolve, reject) => {
            console.log(originName + " chceking if freind request exists or not");
            let findQuery = {
                $or: [
                    {
                        $and: [
                            { senderId: req.body.senderId },
                            { receiverId: req.body.receiverId }
                        ]
                    },
                    {
                        $and: [
                            { receiverId: req.body.senderId },
                            { senderId: req.body.receiverId }
                        ]
                    }
                ]
            }
            FriendRequestModel.findOne(findQuery, (err, result) => {
                if (err) {
                    logger.error('Failed To Retrieve friend request Data', originName, 10)
                    let apiResponse = response.generate(true,
                        'Failed To Retrieve friend request Data', 500, null)
                    reject(apiResponse);
                } else {
                    //friend request does not exist
                    if (check.isEmpty(result)) {
                        console.log(req.body);
                        //create new user
                        let newFriend = new FriendRequestModel({
                            friendRequestId: shortid.generate(),
                            senderId: req.body.senderId,
                            senderUsername: req.body.senderUsername,
                            receiverId: req.body.receiverId,
                            receiverUsername: req.body.receiverUsername,
                            status: 1//as we are creating new pending request
                        });
                        //save new friend request
                        newFriend.save((err, newFriendRequest) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, originName, 10)
                                let apiResponse = response.generate(true,
                                    'Failed to create new Friend request', 500, null)
                                reject(apiResponse)
                            } else {
                                let friendRequestObject = newFriendRequest.toObject();
                                resolve(friendRequestObject)
                            }
                        });

                        //friend request already exist    
                    } else {
                        logger.error('Friend Request Cannot Be Created Already Present', originName, 4)
                        let apiResponse = response.generate(true, 'Friend Request Cannot Be Created.Already Present', 403, null)
                        reject(apiResponse);
                    }
                }
            })

        });
    }

    validateParams(req, res)
        .then(checkIfFriendRequest)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Friend Request created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })



}//end add to friend request

let acceptFriendRequest = (req, res) => {
    //TODO take care of this face in frontend and backend
    //--- FACT this method can only be called the receiver of friend request
    //need both sender and receiver and friend request id
    // the status is set to 2
    //--edit funcitonality will be used
    //if postive ressult from front end we broadcast it to sender side

    console.log(req.body);
    let originName = "user controller : add to freind request";
    let validateParams = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(req.body.senderId) || check.isEmpty(req.body.receiverId)) {
                logger.info('parameters missing', originName, 9)
                let apiResponse = response.generate(true, 'sender or receiver Id Missing', 403, null)
                reject(apiResponse);
            } else {
                resolve();
            }
        })
    } // end of the validateParams function.

    //first check if both user IDs from request are 
    //already sender & receiver or receiver & sender
    //if yes then throw error that friend request already exist
    //if no make one
    let editFriendRequest = (senderId, receiverId) => {
        return new Promise((resolve, reject) => {
            console.log(originName + " chceking if freind request exists or not");

            let findQuery = {
                $or: [
                    {
                        $and: [
                            { senderId: req.body.senderId },
                            { receiverId: req.body.receiverId }
                        ]
                    },
                    {
                        $and: [
                            { receiverId: req.body.senderId },
                            { senderId: req.body.receiverId }
                        ]
                    }
                ]
            }
            let options = {
                status: 2
            }
            FriendRequestModel.update(
                findQuery, options,
                {
                    multi: true
                },
                (err, result) => {
                    if (err) {
                        logger.error(err.message, originName, 10);
                        let apiResponse = response.generate(true,
                            err.message, 500, null);
                        reject(apiResponse);
                    } else if (result == undefined || result == null || result == '') {
                        logger.info('No Friend request Found', originName)
                        let apiResponse = response.generate(true, 'No Friend request Found', 404, null)
                        reject(apiResponse);
                    } else {
                        let apiResponse = response.generate(false, 'Friend request accepted', 200, resolve)
                        resolve(result)

                    }
                });//edit funct end
        });
    }


    validateParams(req, res)
        .then(editFriendRequest)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Friend Request created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}//end accept friend request

let getFriendRequest = (req, res) => {
    //-- here we will use both sender and receiver id to get all 
    // frnd request there are with both in common
    //actually user will send his userId
    // then we will get all frndrequest where he is senderId or requestId matches
    let originName = "user controller : getAllFriend request";
    let userId = req.body.userId;
    console.log(req.body);
    // function to validate params.
    let validateParams = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(userId)) {
                logger.info('parameters missing', originName, 9)
                let apiResponse = response.generate(true, 'User Id Missing', 403, null)
                reject(apiResponse);
            } else {
                resolve();
            }
        })
    } // end of the validateParams function.

    let findChats = () => {
        return new Promise((resolve, reject) => {
            // creating find query.
            let findQuery = {
                $or: [
                    {
                        $and: [
                            { senderId: req.body.userId },
                        ]
                    },
                    {
                        $and: [
                            { receiverId: req.body.userId },
                        ]
                    }
                ]
            }


            FriendRequestModel.find(findQuery)
                .select('-_id -__v')
                .sort('-createdOn')

                .lean()

                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, originName, 10)
                        let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No Friend Request Found', originName);
                        let apiResponse = response.generate(true, 'No Friend Request Found', 404, null)
                        reject(apiResponse)
                    } else {
                        console.log('Friend Request found and listed.')
                        resolve(result);
                    }
                })
        })
    } // end of the find Friend Request

    // making promise call.
    validateParams()
        .then(findChats)
        .then((result) => {
            let apiResponse = response.generate(false, 'All Friend Request Listed', 200, result)
            res.send(apiResponse);
        })
        .catch((error) => {
            res.send(error);
        })



}//-- end get friend request

let areFriends = (req, res) => {
    console.log(req.body);
    let originName = "user controller : add to freind request";
    let validateParams = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(req.body.senderId) || check.isEmpty(req.body.receiverId)) {
                logger.info('parameters missing', originName, 9)
                let apiResponse = response.generate(true, 'User Id Missing', 403, null)
                reject(apiResponse);
            } else {
                resolve();
            }
        })
    } // end of the validateParams function.

    //first check if both user IDs from request are 
    //already sender & receiver or receiver & sender
    //if yes then throw error that friend request already exist
    //if no make one
    let checkIfFriendRequest = (senderId, receiverId) => {
        return new Promise((resolve, reject) => {
            console.log(originName + " chceking if freind request exists or not");
            let findQuery = {
                $or: [
                    {
                        $and: [
                            { senderId: req.body.senderId },
                            { receiverId: req.body.receiverId },
                            { status: 2 }
                        ]
                    },
                    {
                        $and: [
                            { receiverId: req.body.senderId },
                            { senderId: req.body.receiverId },
                            { status: 2 }
                        ]
                    }
                ]
            }
            FriendRequestModel.findOne(findQuery, (err, result) => {
                if (err) {
                    logger.error('Failed To Retrieve friend request Data', originName, 10)
                    let apiResponse = response.generate(true,
                        'Failed To Retrieve friend request Data', 500, null)
                    reject(apiResponse);
                } else {
                    //are not friends does not exist
                    if (check.isEmpty(result)) {
                        console.log(req.body);
                        logger.error('Are not friends', originName, 4)
                        let apiResponse = response.generate(true, 'Are not friends', 403, null)
                        reject(apiResponse);
                        //are friends     
                    } else {
                        resolve(result);
                    }
                }
            })

        });
    }

    validateParams(req, res)
        .then(checkIfFriendRequest)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Both users are friends', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}//end of are freinds

module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    forgotpasswordFunction: forgotPassword,
    sendContactInfoFunction: sendContactInfo,
    changepasswordFunction: changePassword,
    logout: logout,
    getAllUser: getAllUser,
    addToFriendRequest: addToFriendRequest,
    acceptFriendRequest: acceptFriendRequest,
    getFriendRequest: getFriendRequest,
    areFriends: areFriends
}// end exports