require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Todo } = require('./models/todo');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todo', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        completed: req.body.completed,
        completedAt: req.body.completedAt,
        _creator: req.user._id
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todo', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id }).then((todo) => {
        res.send({ todo });   //sending as todo object
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todo/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({ todo });  //sending as todo object
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.delete('/todo/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send("No Todo with the ID");
        }
        res.status(200).send({ todo: todo });  //sending as todo object
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.patch('/todo/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, { $set: body }, { new: true }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({ todo });
    }).catch((e) => {
        res.status(400).send();
    })
});

app.post('/user', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);  //what properties to get from the body
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
        //res.send(newUser);
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

//authenticate is user to verify that the user is associated with token, 
// i.e. a private route for each user
app.get('/user/me', authenticate, (req, res) => {
    res.send(req.user)
});

//POST /user/login
app.post('/user/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {

        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/user/me/token', authenticate, (req, res) => {

    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });

})

app.listen(port, () => {
    console.log(`server started at port ${port}`);
});

module.exports = { app };
