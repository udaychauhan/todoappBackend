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

let addToChangelog = (data) =>{
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    let itemTitle = data.itemTitle;
    let itemDetail = data.itemDetail;
    let itemId = data.itemId;
    let type = data.type;
  
    let originName = "changlogcontroller : addtochangelog";
    console.log(originName)
    let createLog = () => {
        return new Promise((resolve, reject) => {
            ChangeLogModel.findOne({
                'clItemId': itemId,
                'clTodoListId': todoListId,
                'clType' : type
                //TODO find a way to store unique log
                //or should we just store
            })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, originName, 10);
                        let apiResponse = response.generate(true,
                            'Failed to find log', 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(result)) {

                        let changelog = new ChangeLogModel({
                            clTodoListId: todoListId,
                            clUserId: userId,
                            clUserName: userName,
                            clItemId: itemId,
                            clItemTitle: itemTitle,
                            clItemDetail: itemDetail,
                            clType : type,
                            clId : shortid.generate()
                        });

                        changelog.save((err, result) => {
                            if (err) {
                                logger.error(err.message, originName, 10)
                                let apiResponse = response.generate(true,
                                    'Failed to create new chnagelog item', 500, null)
                                reject(apiResponse)
                            } else {
                                //coverts to javascript object??
                                let changelogObject = changelog.toObject();
                                resolve(changelogObject)
                            }
                        })
                    } else {
                        logger.error('change log Item Cannot Be Created. Already Present', originName, 4)
                        let apiResponse = response.generate(true,
                            'change log Already Present With this Name', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    createLog()
        .then((resolve) => {
          let apiResponse = response.generate(false, 'change log  created', 200, resolve);
          console.log("Change log added " + JSON.stringify(resolve));
        })
        .catch((err) => {
            console.log("Error in creating chnage log " + JSON.stringify(err));
        })
//--not implementing edit until modal sorted, maybe in end
//-- implement change log completely

}

let getAllChangeLog = (data,callback)=>{
    let originName = "changelogcontroller : getAllChangeLog";
    let userId = data.userId;
    let todoListId = data.todoListId;
    // function to validate params.
    let validateParams = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(todoListId)) {
                logger.info('parameters missing', originName, 9)
                let apiResponse = response.generate(true, 'changelog todo list id Missing', 403, null)
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
                clTodoListId: todoListId
            }

            ChangeLogModel.find(findQuery)
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
                        logger.info('No Change Log Found', originName);
                        let apiResponse = response.generate(true, 'No Change Log Found', 404, null)
                        reject(apiResponse)
                    } else {
                        console.log('Change Log found and listed.')
                        // reversing array.
                        let reverseResult = result.reverse()
                        resolve(reverseResult);
                    }
                })
        })
    } // end of the find todo list function

    // making promise call.
    validateParams()
        .then(findChats)
        .then((result) => {
            let apiResponse = response.generate(false, 'All Change Log Listed', 200, result)
            callback(null, apiResponse);
        })
        .catch((error) => {
            callback(error, null);
        })



}

let handleUndoAction = (data,callback) => {
    let type = data.clType;
    let changelogId = data.clId;
    if(type){

        if(type === "DELETE"){
            createToDoItemFromChangeLog(data,(err,result)=>{
                if(err){
                    deleteChangelog(data,(err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
                    });
                    callback(err,null);
                }else{
                    deleteChangelog(data,(err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
                    });
                    callback(null,result);
                }
            });
            console.log(JSON.stringify(data));
        }

        if(type === "ADD"){
            deleteItemFromChangelog(data,(err,result)=>{
                if(err){
                    deleteChangelog(data,(err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
                    });
                    callback(err,null);
                }else{
                    deleteChangelog(data,(err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
                    });
                    callback(null,result);
                }
            });
            console.log(JSON.stringify(data));
        }

        if(type === "EDIT"){
            editItemFromChangelog(data,(err,result)=>{
                if(err){
                    deleteChangelog(data,(err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
                    });
                    callback(err,null);
                }else{
                    deleteChangelog(data,(err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
                    });
                    callback(null,result);
                }
            });
            console.log(JSON.stringify(data));
        }

    }else{
        //throw error in callback
    }
}

let deleteChangelog = (data,callback) =>{
    //to be called after handle undo is success
    let originName = "changelogcontroller : deletechangelog";
    //as no item can have same id so deleteing using item id only
    ChangeLogModel.findOneAndRemove({ 'clId': data.clId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, originName, 10)
            let apiResponse = response.generate(true, 'Failed To delete change log', 500, null)
            callback(apiResponse, null);
        } else if (check.isEmpty(result)) {
            logger.info('No change log Found', originName)
            let apiResponse = response.generate(true, 'No change log found Found', 404, null)
            callback(apiResponse, null);
        } else {
            logger.info('Change log Deleted', originName)
            let apiResponse = response.generate(false, 'Deleted the change log successfully', 200,
                result)
            callback(null, apiResponse);
        }
    });


}

//--- here we have to include some tod item controller because the changelog controller 
//is called before the todo item controller and hence all the methods it imports from
// todo item controller are not found
let createToDoItemFromChangeLog = (data, callback) => {
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    let itemTitle = data.itemTitle;
    let itemDetail = data.itemDetail;
    let parentItemId = data.parentItemId;
    let parentItemTitle = data.parentItemTitle;

    // first check if chat room with that name exists or not
    let originName = "changelogController : createToDoItemFromChangeLog";
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
           callback(null, apiResponse);
           
        })
        .catch((err) => {
            callback(err, null);
        })

}

let deleteItemFromChangelog = (data, callback) => {
    //will be needing list and item id 
    //userid and username for changelog
    let itemId = data.itemId;
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    let itemTitle = data.itemTitle;
    let itemDetail = data.itemDetail;

    let originName = "changelogCOntroller : deleteItem";
    
    
    // function to validate params.
     let validateParams = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(itemId)) {
                logger.info('parameters missing', originName, 9)
                let apiResponse = response.generate(true, 'ItemId Missing', 403, null)
                reject(apiResponse);
            } else {
                resolve();
            }
        })
    } 

    let deleteitem = () =>{
        return new Promise((resolve, reject) => {
            ToDoListItem.findOneAndRemove({ 'itemId': itemId }).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, originName, 10)
                    let apiResponse = response.generate(true, 'Failed To delete item', 500, null)
                    reject(apiResponse);
                   
                } else if (check.isEmpty(result)) {
                    logger.info('No Item Found', originName)
                    let apiResponse = response.generate(true, 'No Item Found', 404, null)
                    reject(apiResponse);
                   
                } else {
                    logger.info('Item Deleted', originName)
                    resolve(result);
                  
                }
            });// end item model find and remove
        
        });


       
    }

    validateParams()
    .then(deleteitem)
    .then((result) => {
        let apiResponse = response.generate(false, 'Deleted the Item successfully', 200,
                        result)
        callback(null, apiResponse);
    })
    .catch((error) => {
        callback(error, null);
    })

   

}

let editItemFromChangelog = (data,callback) =>{
    let itemId = data.itemId;
    let userId = data.userId;
    let userName = data.userName;
    let todoListId = data.todoListId;
    let itemTitle = data.itemTitle;
    let itemDetail = data.itemDetail;

    let options = data;
    console.log(options);
    let originName = "changelog controller ; edit item from changelog"
    ToDoListItem.update(
        {
            'itemId': itemId,
            'todoListId':todoListId
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
                callback(null, apiResponse);

            }
        }

    );

}

module.exports = {
    addToChangelog : addToChangelog,
    handleUndoAction : handleUndoAction,
    getAllChangeLog : getAllChangeLog
}


