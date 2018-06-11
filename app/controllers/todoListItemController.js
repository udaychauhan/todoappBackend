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
const ToDoListItem = mongoose.model('ToDoListItem');
const ChangeLogModel = mongoose.model('ChangeLog');

const changelogController = require('./changelogController');

let createToDoItem = (data, callback) => {
    // uath token validity and user in db is checked when setting 
    //socket connecction so do we need to set it again
    //data contains userId, userName,todoItemId,todoItemTitle
    //,todoItemDetail
    //todoListId
    //let itemId = data.itemId;
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    let itemTitle = data.itemTitle;
    let itemDetail = data.itemDetail;
    let parentItemId = data.parentItemId;
    let parentItemTitle = data.parentItemTitle;

    // first check if chat room with that name exists or not
    let originName = "todoListItemController : createToDoItem";
    let createItem = () => {
        return new Promise((resolve, reject) => {
            //no same itemname within a todo list
            //in different list same names can work
            ToDoListItem.findOne({
                'itemTitle': itemTitle,
                'todoListId': todoListId
            })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, originName, 10);
                        let apiResponse = response.generate(true,
                            'Failed to find Item', 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(result)) {

                        let todoItem = new ToDoListItem({
                            todoListId: todoListId,
                            userId: userId,
                            userName: userName,
                            itemId: shortid.generate(),
                            itemTitle: itemTitle,
                            itemDetail: itemDetail,
                            parentItemId: parentItemId,
                            parentItemTitle: parentItemTitle,
                            createdOn: time.now(),
                            modifiedOn: time.now(),
                        });

                        todoItem.save((err, result) => {
                            if (err) {
                                logger.error(err.message, originName, 10)
                                let apiResponse = response.generate(true,
                                    'Failed to create new todo item', 500, null)
                                reject(apiResponse)
                            } else {
                                //coverts to javascript object??
                                let todoListObject = todoItem.toObject();
                                resolve(todoListObject)
                            }
                        })
                    } else {
                        logger.error('Todo Item Cannot Be Created. Already Present', originName, 4)
                        let apiResponse = response.generate(true,
                            'Todo Item Already Present With this Name', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    createItem()
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Todo Item  created', 200, resolve);
            let cldata = {
                type: "ADD",
                todoListId: resolve.todoListId,
                userId: resolve.userId,
                userName: resolve.userName,
                itemId: resolve.itemId,
                itemTitle: resolve.itemTitle,
                itemDetail: resolve.itemDetail,
            }
            console.log("Data for add chnagelog " + JSON.stringify(cldata));
            //TODO NO CALLBACCK INCASE OF CHANGE LOG!
            changelogController.addToChangelog(cldata);
            //---change log
            callback(null, apiResponse);
           
        })
        .catch((err) => {
            callback(err, null);
        })

}

let getAllTodoItems = (data, callback) => {
    let originName = "todoItemController : getAllTodoItem";
    let userId = data.userId;
    let todoListId = data.todoListId;


    // function to validate params.
    let validateParams = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(todoListId)) {
                logger.info('parameters missing', originName, 9)
                let apiResponse = response.generate(true, 'TODO LIST ID Missing', 403, null)
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
                todoListId: todoListId
            }

            ToDoListItem.find(findQuery)
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
                        logger.info('No Todo Item Found', originName);
                        let apiResponse = response.generate(true, 'No Todo Items Found', 404, null)
                        reject(apiResponse)
                    } else {
                        console.log('Todo Items found and listed.')
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
            let apiResponse = response.generate(false, 'All Todo Item Listed', 200, result)
            callback(null, apiResponse);
        })
        .catch((error) => {
            callback(error, null);
        })


}

let deleteItem = (data, callback) => {
    //will be needing list and item id 
    //userid and username for changelog
    let itemId = data.itemId;
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    let itemTitle = data.itemTitle;
    let itemDetail = data.itemDetail;

    let originName = "todoListItemCOntroller : deleteItem";
    //as no item can have same id so deleteing using item id only
    ToDoListItem.findOneAndRemove({ 'itemId': itemId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, originName, 10)
            let apiResponse = response.generate(true, 'Failed To delete item', 500, null)
            callback(apiResponse, null);
        } else if (check.isEmpty(result)) {
            logger.info('No Item Found', originName)
            let apiResponse = response.generate(true, 'No Item Found', 404, null)
            callback(apiResponse, null);
        } else {
            logger.info('Item Deleted', originName)
            let apiResponse = response.generate(false, 'Deleted the Item successfully', 200,
                result)
            // data for change log
            let cldata = {
                type: "DELETE",
                todoListId: result.todoListId,
                userId: result.userId,
                userName: result.userName,
                itemId: result.itemId,
                itemTitle: result.itemTitle,
                itemDetail: result.itemDetail,
            }
            console.log("Data for delete chnagelog " + JSON.stringify(cldata));
            changelogController.addToChangelog(cldata);
            //----changelog
            callback(null, apiResponse);
        }
    });// end item model find and remove


}

let editItem = (data, callback) => {
    //willbe needing 
    //todoListId and item id
    //userid and username
    //itemtitle and itemdetail
    //previousItemTitle and prevItemDetail

    //item id to search that item
    let itemId = data.itemId;
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    let itemTitle = data.itemTitle;
    let itemDetail = data.itemDetail;
    let prevItemTitle = data.prevItemTitle;
    let prevItemDetail = data.prevItemDetail;

    let options = data;
    console.log(options);

    let originName = "todlistitemcontroller : edit todo list item";
    ToDoListItem.update(
        {
            'itemId': itemId,
            'todoListId' : todoListId
        }, options,
        {
            multi: true
        },
        (err, result) => {

            if (err) {
                logger.error(err.message, originName, 10);
                let apiResponse = response.generate(true,
                    err.message, 500, null);
                callback(apiResponse, null);
            } else if (result == undefined || result == null || result == '') {
                logger.info('No Item Found', originName)
                let apiResponse = response.generate(true, 'No Item Found', 404, null)
                callback(apiResponse, null);
            } else {
                let apiResponse = response.generate(false, 'Item Edited Successfully', 
                200, result)
                
                //---- changelog start
                //here result also doesn't contains data
                let cldata = {
                    type: "EDIT",
                    todoListId: data.todoListId,
                    userId: data.userId,
                    userName: data.userName,
                    itemId: data.itemId,
                    itemTitle: data.prevItemTitle,
                    itemDetail: data.prevItemDetail,
                }
                console.log("Data for edit chnagelog " + JSON.stringify(cldata));
                changelogController.addToChangelog(cldata);
                //----changelog
                //---- changelog end
                callback(null, apiResponse);

            }
        }

    );

}

module.exports = {
    createToDoItem: createToDoItem,
    getAllTodoItems: getAllTodoItems,
    deleteItem: deleteItem,
    editItem: editItem
}