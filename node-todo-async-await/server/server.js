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

app.post('/todo', authenticate, async (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        completed: req.body.completed,
        completedAt: req.body.completedAt,
        _creator: req.user._id
    });

    try {
        const doc = await todo.save();
        res.send(doc);
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/todo', authenticate, async (req, res) => {
    try {
        const todo = await Todo.find({ _creator: req.user._id })
        res.send({ todo });
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/todo/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    try {
        const todo = await Todo.findOne({
            _id: id,
            _creator: req.user._id
        });
        if (!todo) {
            return res.status(404).send();
        }
        res.send({ todo });
    } catch (e) {
        res.status(400).send(e);
    }
});

app.delete('/todo/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    try {
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        })
        if (!todo) {
            return res.status(404).send("No Todo with the ID");
        }
        res.status(200).send({ todo: todo });
    } catch (e) {
        res.status(400).send(e);
    }
});

app.patch('/todo/:id', authenticate, async (req, res) => {
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
    try {
        const todo = await Todo.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, { $set: body }, { new: true });
        if (!todo) {
            return res.status(404).send();
        }
        res.send({ todo });
    } catch (e) {
        res.status(400).send();
    }
});

app.post('/user', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);  //what properties to get from the body
        const user = new User(body);
        await user.save();
        const token = user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

//authenticate is user to verify that the user is associated with token, 
// i.e. a private route for each user
app.get('/user/me', authenticate, (req, res) => {
    res.send(req.user)
});

//POST /user/login
app.post('/user/login', async (req, res) => {
    try {
        var body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password)
        const token = await user.generateAuthToken()
        res.header('x-auth', token).send(user);
    }
    catch (e) {
        res.status(400).send();
    }
});

app.delete('/user/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
});

app.listen(port, () => {
    console.log(`server started at port ${port}`);
});

module.exports = { app };
