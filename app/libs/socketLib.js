const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib');
const tokenLib = require('./tokenLib');
const check = require('./checkLib');
const response = require('./responseLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const todoListController =  require('../controllers/todoListController');
const todoItemController =  require('../controllers/todoListItemController');
const changelogController =  require('../controllers/changelogController');

let setServer = (server) => {
    let allOnlineUsers = [];

    let io = socketio.listen(server);

    let myIo = io.of('');

    // whenever we want to do cross soccket communication we use io (or myIo) 
    // because socket is our pipe and from our pipe (i.e socket) we emit it on 
    // myIo that can be assumed to be collection of pipe 

    // an observation these sockets are pipe from client to server


    myIo.on('connection', (socket) => {
        console.log('on connection -- emitting verify user');
        // this socket will emit this event and whoever 
        // connects wiht this socket will get this event
        let onConnectionData = {
            message: 'Socket Connected',
        }
        socket.emit('verifyUser', onConnectionData);
        
        // this event was emitted from the client side
        // now it is upto socket what to do
        //socket room id and name will be send by user along with authToken
        socket.on('setUser', (data) => {
            console.log('setUser called' + data);
            let authToken = data.authToken;
            let userId = data.userId;
           
            tokenLib.verifyClaimWithoutSecret(data.authToken, (err, user) => {
                if (err) {
                    socket.emit("errorEvent", "Auth Error! PLease Login Again!");
                    socket.disconnect(true);
                } else {
                    console.log('user is verified -setting details');
                    let currentUser = user.data;
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`;
                    console.log('full name is ' + fullName);
                    //setting socket user id
                    //now this is where the socket gets identity
                    // if socket already has userId then no need to set it
                    //---- find fix for multiple user adding to online user list
                    socket.userId = userId;
                    socket.name = fullName;
                    let userObj = { userId: currentUser.userId, fullName: fullName };
                    allOnlineUsers.push(userObj);
                    console.log(allOnlineUsers);
                    //-- as this will be execued for every user therefore all user will join same room
                    // setting room name
                    socket.room = "UNIVERSAL ROOM";
                    //joining chat room
                    socket.join(socket.room);
                    console.log('joined chat room ' + socket.room);
                    let obj = {
                        message: 'join',
                        sendBy: fullName,
                        list: allOnlineUsers
                    }
                    socket.to(socket.room).broadcast.emit('onlineUserList', obj);

                    let data = {
                        socketId : socket.userId,
                        socketName : socket.name,
                        roomName : socket.room,
                    }
                    socket.emit("userSet", data);
                }
            });
            
        });

        //-------- TODO LIST
        //listen create new todo list
        socket.on('createNewTodoList' , (data) =>{
            //--data contains
            //userId
            //userName
            //todoList title
            let infoFromFrontEnd = data.userId + data.userName + data.todoListTitle;
            console.log('From front end ' + infoFromFrontEnd);

            //emits created new todoList
            //emits data same as above plus
            //todoListId, createdOn
            //TODO create a general emitter and distinguish it 
            // on basis of type like todoListCreated

            todoListController.createNewTodoList(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "todoListCreated",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "todoListCreated",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
            
           
        });

        //listen for all todo list 
        socket.on('getAllTodoList', (data) =>{
            //data contains
            //data = {
            //     userId : userId
            // }
            //-- userId
            todoListController.getAllTodoList(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "allTodoList",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "allTodoList",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
        });

        //--- delete todo list
        socket.on('deleteTodoList' , (data) =>{
           
            let userId = data.userId;
            let userName = data.userName;
            let todoListId = data.todoListId;
                      
        
            let infoFromFrontEnd = userId +" "+ userName +" "+todoListId;
            console.log('From front end ' + infoFromFrontEnd);

            todoListController.deleteTodoList(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "todoListDeleted",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "todoListDeleted",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
            
           
        });//--end delete todo lsit
        
        //---------- TODO ITEM
        //--- create todo item
        socket.on('createNewTodoItem' , (data) =>{
           
            let userId = data.userId;
            let userName = data.userName;
            let todoListId = data.todoListId;
            let itemTitle = data.itemTitle;
            let itemDetail = data.itemDetail;
            let parentItemId = data.parentItemId;//maybe
            let parentItemTitle = data.parentItemTitle;//maybe
        
            let infoFromFrontEnd = data.userId +" "+  +" "+ data.todoListId;
            console.log('From front end ' + infoFromFrontEnd);

            //emits created new todoList
            //emits data same as above plus
            //todoListId, createdOn
            //TODO create a general emitter and distinguish it 
            // on basis of type like todoListCreated

            todoItemController.createToDoItem(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "todoItemCreated",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "todoItemCreated",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
            
           
        });//-- end create todo item

        //--- delete todo item
        socket.on('deleteTodoItem' , (data) =>{
           
            let userId = data.userId;
            let userName = data.userName;
            let todoListId = data.todoListId;
            let itemId = data.itemId;
            let itemTitle = data.itemTitle;
            let itemDetail = data.itemDetail;
            
        
            let infoFromFrontEnd = data.userId +" "+ userName +" "+ data.todoListId;
            console.log('From front end ' + infoFromFrontEnd);

            todoItemController.deleteItem(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "todoItemDeleted",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "todoItemDeleted",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
            
           
        });//-- end delete todo item

        //---get all todo item
        socket.on('getAllTodoItems', (data) =>{
            //data contains
            //data = {
            //     userId : userId
            // }
            //-- userId
            todoItemController.getAllTodoItems(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "allTodoItems",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "allTodoItems",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
        });
        //---end all todo item

        // ---- edit list item
        socket.on('editListItem', (data) =>{
           
            todoItemController.editItem(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "editListItem",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "editListItem",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
        });
        //--- end edit list item

        //------ Changlog 
        //---get all chnage log
        socket.on('getAllChangelog', (data) =>{
            // userId : this.userId,
            // todoListId : this.todoListId,
            changelogController.getAllChangeLog(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "allChangelog",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "allChangelog",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
        });
        //---end get all change item

        //---undo change log
        socket.on('undoChangelog', (data) =>{
            // userId : this.userId,
            // todoListId : this.todoListId,
            changelogController.handleUndoAction(data,(err,result)=>{
                if(err){
                    let data = {
                        type : "undoChangelog",
                        message : err
                    }
                    socket.emit('generalTodoListAction', data);
                }else{
                    console.log(result);
                    let data = {
                        type : "undoChangelog",
                        message : result
                    }
                    socket.emit('generalTodoListAction', data);
                }
            });
        });
        //--- undo chnage log

        //-- broadcast message listener
        socket.on('broadcastMessage', (data) => {
            console.log(data);
            console.log("broad cast message send by " + data.broadcastMessageBy + "to " + socket.room);
            socket.to(socket.room).broadcast.emit('broadcastMessage', data);
        });
        //-- end broadcast message listener

        //listen change event, commit change and add to change log
        socket.on('disconnect', () => {
            //disconnecct the user from the socket
            // remove the user from online list
            // unsubscribe the user from his own channel

            console.log('user is disconnected');
            console.log(socket.userId);

            var removeIndex = allOnlineUsers.map(function (user) { return user.userId; }).indexOf(socket.userId);
            allOnlineUsers.splice(removeIndex, 1);
            console.log(allOnlineUsers);

            let obj = {
                message: 'left',
                sendBy: socket.name,
                list: allOnlineUsers
            }
            socket.to(socket.room).broadcast.emit('onlineUserList', obj);
            socket.leave(socket.room);
            // socketId : socket.userId,
            // socketName : socket.name,
            // roomName : socket.room,
        });

    });
}





module.exports = {
    setServer: setServer
}

// observations
// socket.emit('error',"message");
//here the emit error event is something taht is inbuilt event and needs to be handled
// so create your own event so that server does not crash