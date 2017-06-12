const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test'
}, {
    _id: new ObjectID(),
    text: 'second test'
}]

//Run some code before every test case
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todo', () => {
    it('should create a new todo', (done) => {
        var text = 'test todo text';

        request(app)
            .post('/todo')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            //Till this point we asserted whether we get the data,
            //next we have to see if mongodb contains the data
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find({ text }).then((todo) => {
                    expect(todo.length).toBe(1);
                    expect(todo[0].text).toBe(text);
                    done();
                }).catch((e) => {
                    done(e);
                });
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todo')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({}).then((todo) => {
                    expect(todo.length).toBe(2);
                    done();
                }).catch((e) => done(e))
            })

    });
});

describe('GET /todo', () => {
    it('should get todo list', (done) => {
        request(app)
            .get('/todo')
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.length).toBe(2)
            })
            .end(done);
    })
});

describe('GET /todo/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todo/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done);
    });

    it('should return a 404 if todo not found i.e. wrong ID', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todo/${todos[0].hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return a 404 for a non-objectID', (done) => {
        request(app)
            .get(`/todo/123`)
            .expect(404)
            .end(done);
    });
});