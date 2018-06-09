const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.
    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);

    // params: firstName, lastName, email, mobileNumber, password
    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    // params: authtoken , senderId , receiverid, status
    app.post(`${baseUrl}/addToFriendRequest`,auth.isAuthorized, userController.addToFriendRequest);

    //params : authtoken, userId
    app.post(`${baseUrl}/getFriendRequest`,auth.isAuthorized, userController.getFriendRequest);

    //params : authtoken, senderId, receiverId, status =2
    app.post(`${baseUrl}/acceptFriendRequest`,auth.isAuthorized, userController.acceptFriendRequest);

    //params : authtoken, senderId, receiverId 
    app.post(`${baseUrl}/areFriends`,auth.isAuthorized, userController.areFriends);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout to logout user.
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null

        }
    */

    app.post(`${baseUrl}/forgotpassword`, userController.forgotpasswordFunction);

    app.post(`${baseUrl}/changepassword`, userController.changepasswordFunction);
    // auth token params: userId.
    app.post(`${baseUrl}/logout`, userController.logout);

}
