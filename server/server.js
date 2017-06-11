const express = require('express');
const bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user')
var { Todo } = require('./models/todo')

var app = express();

app.use(bodyParser.json());

app.post('/todo', (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        completed: req.body.completed,
        completedAt: req.body.completedAt
    })
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
    ;
});

app.get('/todo', (req, res) => {
    Todo.find({}).then((todo) => {
        res.send({ todo })
    }, (e) => {
        res.status(400).send(e);
    });
});
app.listen(3000, () => {
    console.log('Started');
});

module.exports = { app };
