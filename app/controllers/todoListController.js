const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')

const ToDoListModel = mongoose.model('ToDoList');
const UserModel = mongoose.model('User');
const AuthModel = mongoose.model('Auth');

let createNewTodoList =  (data ,callback) => {

    //--data contains
            //userId
            //userName
            //todoList title

             // first check if chat room with that name exists or not
    let originName = "todoListController : createToDoList";
    let createList = () => {
        return new Promise((resolve, reject) => {
            ToDoListModel.findOne({ todoListTitle: data.todoListTitle })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, originName, 10);
                        let apiResponse = response.generate(true,
                             'Failed To Create Chat room', 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(result)) {
                        let creatorId = data.userId;
                        let creatorName = data.userName;
                        let title = data.todoListTitle;

                        let todoList = new ToDoListModel({
                            todoListId : shortid.generate(),
                            todoListTitle: title,
                            userName: creatorName,
                            userId: creatorId,
                            createdOn: time.now(),
                        });

                        todoList.save((err, result) => {
                            if (err) {
                                logger.error(err.message, originName, 10)
                                let apiResponse = response.generate(true,
                                     'Failed to create new todo list', 500, null)
                                reject(apiResponse)
                            } else {
                                //coverts to javascript object??
                                let todoListObject = todoList.toObject();
                                resolve(todoListObject)
                            }
                        })
                    } else {
                        logger.error('Todo List Cannot Be Created. Already Present', originName, 4)
                        let apiResponse = response.generate(true, 
                            'Todo List Already Present With this Name', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    createList()
    .then((resolve) => {
        let apiResponse = response.generate(false, 'Todo List  created', 200, resolve)
        callback(null,apiResponse);
    })
    .catch((err) => {
        callback(err,null);
    })
}

//gets all todod ist bassed on user id
let getAllTodoList = (data ,callback) => {
    let originName = "todoListController : getAllTodoList";
    // function to validate params.
    let validateParams = () => {
        return new Promise((resolve, reject) => {
            let userId = data.userId;
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
                userId: data.userId
            }

            ToDoListModel.find(findQuery)
                .select('-_id -__v')
                .sort('-createdOn')
                //.skip(parseInt(req.body.skip) || 0)
                .lean()
                //.limit(10)
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, originName, 10)
                        let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No Todo List Found', originName);
                        let apiResponse = response.generate(true, 'No Todo List Found', 404, null)
                        reject(apiResponse)
                    } else {
                        console.log('Todo List found and listed.')
                        // reversing array.
                        //let reverseResult = result.reverse()
                        resolve(result);
                    }
                })
        })
    } // end of the find todo list function

    // making promise call.
    validateParams()
        .then(findChats)
        .then((result) => {
            let apiResponse = response.generate(false, 'All Todo List Listed', 200, result)
            callback(null,apiResponse);
        })
        .catch((error) => {
            callback(error,null);
        })


}//---end get all todo list

let deleteTodoList = (data, callback) => {
   
    
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    

    let originName = "todoListCOntroller : delete";
    //as no item can have same id so deleteing using item id only
    ToDoListModel.findOneAndRemove({ 'todoListId': todoListId,'userId' :userId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, originName, 10)
            let apiResponse = response.generate(true, 'Failed To delete List', 500, null)
            callback(apiResponse, null);
        } else if (check.isEmpty(result)) {
            logger.info('No Item Found', originName)
            let apiResponse = response.generate(true, 'No List Found', 404, null)
            callback(apiResponse, null);
        } else {
            logger.info('Item Deleted', originName)
            let apiResponse = response.generate(false, 'Deleted the List successfully', 200,
                result)
            callback(null, apiResponse);
        }
    });// end item model find and remove


}//---delete todo list

module.exports = {
    createNewTodoList : createNewTodoList,
    getAllTodoList : getAllTodoList,
    deleteTodoList : deleteTodoList
}