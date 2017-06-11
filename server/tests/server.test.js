const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

//Run some code before every test case
beforeEach((done) => {
    Todo.remove({}).then(() => {
        done()
    });
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
                Todo.find().then((todo) => {
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
                    expect(todo.length).toBe(0);
                    done();
                }).catch((e) => done(e))
            })

    });
});