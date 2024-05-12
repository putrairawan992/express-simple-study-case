async function runTests() {
    const chai = require('chai');
    const chaiHttp = await require('chai-http');
    const app = require('./index.js');
    const users = require('../models/users.js'); 

    chai.use(chaiHttp);
    const expect = chai.expect;

    describe('User Registration', () => {
        it('should register a new user', (done) => {
            chai.request(app)
                .post('/users')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phoneNumber: '1234567890',
                    password: 'password',
                    confirmPassword: 'password'
                })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('message').equal('User registered successfully');
                    expect(res.body).to.have.property('user');
                    done();
                });
        });
    });
    
    describe('Get Users', () => {
        it('should return a list of users', (done) => {
            chai.request(users)
                .get('/getusers')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });
    
    describe('Update User', () => {
        it('should update an existing user', (done) => {
            chai.request(users)
                .put('/api/users/john@example.com')
                .send({
                    firstName: 'UpdatedJohn'
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('firstName').equal('UpdatedJohn');
                    done();
                });
        });
    });
    
    describe('Delete User', () => {
        it('should delete an existing user', (done) => {
            chai.request(users)
                .delete('/api/users/john@example.com')
                .end((err, res) => {
                    expect(res).to.have.status(204);
                    done();
                });
        });
    });

    run();
}

runTests();
