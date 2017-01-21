import * as supertest from 'supertest';
import 'mocha';
import * as chai from 'chai';
const should = chai.should();
const expect = chai.expect;

const server = supertest.agent('http://localhost:8080');

describe('the running server', () => {
    let token = '';

    before(function(done) {
        this.timeout(5000);

        server
            .post('/auth/login')
            .send({username: 'john', password: 'passw0rd'})
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err: Error, res) => {
                if(err) {
                    return done(err);
                }
                should.exist(res.body.token);
                expect(res.body.authenticated).to.be.true;
                token = res.body.token;
                done(err);
            });
    });

    it('should return all things', (done) => {
        server
            .get('/api/v1/things/john')
            .set('x-access-token', token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                expect(res.body).lengthOf(2);
                done(err);
            });
    });

    it('should not return all things to unauthenticated user', (done) => {
        server
            .get('/api/v1/things/john')
            .expect(403)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                expect(res.body.success).to.be.false;
                done(err);
            });
    });
});