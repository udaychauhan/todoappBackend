const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.

    //params : authtoken
    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);
     /**
	* @api {get} /api/v1/user/view/all Get all users
	* @apiVersion 0.0.1
	* @apiGroup  User
	*
	
	
	* @apiParam {string} authToken AuthToken of the user. (body params) (required)
   
	*
	  @apiSuccessExample {json} Success-Response:
	*  {
	*   "error": false,
	*   "message": "All User Details Found",
	*   "status": 200,
	*   "data": Array of users
	*  	}
     **/


    // params: firstName, lastName, email, countryCode,phoneNumber, password
    app.post(`${baseUrl}/signup`, userController.signUpFunction);
    /**
	* @api {post} /api/v1/user/signup Create New  User
	* @apiVersion 0.0.1
	* @apiGroup  User
	*
	* @apiParam {string} firstName name of the suer passed as a body parameter
	* @apiParam {string} lastName of the user passed as a body parameter
	* @apiParam {string} email email of the user. (body params) (required)
    * @apiParam {string} password password of the user. (body params) (required)
	* @apiParam {number} countryCode category of the user passed as a body parameter
	* @apiParam {number} phoneNUmber category of the user passed as a body parameter
	*
	  @apiSuccessExample {json} Success-Response:
	*  {
	*   "error": false,
	*   "message": "User Created.",
	*   "status": 200,
	*   "data": [
    *				{
    *					_id: "string",
                        firstName: "string",
                        lastName: "string",
                        emailId: "string",
                        countryCode : "number",
                        phoneNumber: "number",
                        userId:"string",
                        createdOn:"string"
	*                   __v: number
    *				}
	*   		]
	*  	}
     **/


    // params: authtoken , senderId , receiverid, status
    app.post(`${baseUrl}/addToFriendRequest`,auth.isAuthorized, userController.addToFriendRequest);
      /**
     * @apiGroup Friends
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/addToFriendRequest Add to Friend Request
     * 
     * @apiParam {string} authToken AuthToken of the sender. (body params) (required)
     * @apiParam {string} senderId userId of the sender. (body params) (required)
     * @apiParam {string} receiverId userId of the receiver. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Friend Request created",
            "status": 200,
            "data": {
                "frienRequestId": String
                "senderId": String
                "receiverId" : String
                "status": number
                "dateCreated":number
            }

        }
    */


    //params : authtoken, userId
    app.post(`${baseUrl}/getFriendRequest`,auth.isAuthorized, userController.getFriendRequest);
      /**
     * @apiGroup Friends
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/getFriendRequest Get all Friend Request
     * 
     * @apiParam {string} authToken AuthToken of the sender. (body params) (required)
     * @apiParam {string} userID userId of the sender. (body params) (required)
    
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "All Friend Request Listed",
            "status": 200,
            "data": Array of friend request

        }
    */
    
    //params : authtoken, senderId, receiverId, status =2
    app.post(`${baseUrl}/acceptFriendRequest`,auth.isAuthorized, userController.acceptFriendRequest);
       /**
     * @apiGroup Friends
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/acceptFriendRequest Accept Friend Request.
     * 
     * @apiParam {string} authToken AuthToken of the sender. (body params) (required)
     * @apiParam {string} senderId userId of the sender. (body params) (required)
     * @apiParam {string} receiverId userId of the receiver. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Friend request accepted,
            "status": 200,
            "data": {
                nOk: number,
                modified : 1
            }

        }
    */
    
    
    //params : authtoken, senderId, receiverId 
    app.post(`${baseUrl}/areFriends`,auth.isAuthorized, userController.areFriends);
       /**
     * @apiGroup Friends
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/areFriends Check If Friends.
     * 
     * @apiParam {string} authToken AuthToken of the sender. (body params) (required)
     * @apiParam {string} senderId userId of the sender. (body params) (required)
     * @apiParam {string} receiverId userId of the receiver. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Both users are friends",
            "status": 200,
            "data":Friend Request data

        }
    */
    

    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction);
    /**
     * @apiGroup User
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login Login User.
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
                "countryCode" : number
                "phoneNumber": 2234435524,
                "emailId": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    app.post(`${baseUrl}/forgotpassword`, userController.forgotpasswordFunction);
    /**
    * @apiGroup users
    * @apiVersion  1.0.0
    * @api {post} /api/v1/users/forgotpassword Forgot Password.
    * @apiGroup  User
    * 
    * @apiParam {string} email email of the user. (body params) (required)
   
    *
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * @apiSuccess {object} Use the url on your mail as authentication to change password
    * 
    * @apiSuccessExample {object} Success-Response:
        {
           "error": false,
           "message": "Mail sent"
           "status": 200,
           "data": null

       }
   */


    app.post(`${baseUrl}/changepassword`, userController.changepasswordFunction);
      /**
    * @apiGroup User
    * @apiVersion  1.0.0
    * @api {post} /api/v1/users/changepassword  Change Password.
    *
    * @apiParam {string} token Token generated from forgot password api. (body params) (required)
    * @apiParam {string} password Password of the user that he wants to change. (body params) (required)
    * 
   
    *
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * 
    * @apiSuccessExample {object} Success-Response:
        {
           "error": false,
           "message": "Password changed for uday@gmail.com"
           "status": 200,
           "data": null

       }
   */   

    // auth token params: userId.
    app.post(`${baseUrl}/logout`, userController.logout);

}
