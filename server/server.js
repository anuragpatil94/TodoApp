const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        //Validators
        required: true,  //isRequired
        minlength: 1,    //minimum length of text field should be 1
        trim: true        //removes white spaces from left and right of string
    },
    completed: {
        type: Boolean,
        default: false

    },
    completedAt: {
        type: Number,
        default: null
    }
});

// var newTodo = new Todo({
//     text: 'Cook Dinner'
// });
// newTodo.save().then((doc) => {
//     console.log('Saved Todo: ', doc);
// }, (err) => {
//     console.log(err);
// });

// var newTodo2 = new Todo({
//     text: '  Edit this Video Again ',
//     completed: true,
//     completedAt: 123
// });
// newTodo2.save().then((doc) => {
//     console.log('Saved Todo: ', doc);
// }, (err) => {
//     console.log(err);
// });

//User
//email

var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    }
});

var newUser = new User({
    email:'a@gmail.com' //not completed
})

newUser.save().then((result) => {
    console.log('User Added: \n', result);

}, (e) => {
    console.log(e);

});