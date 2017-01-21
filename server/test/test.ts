import { User } from '../src/entities/user.model';
import 'mocha';
import * as chai from 'chai';
let should = chai.should();

describe('A user', function() {
  describe('when created', () => {
    let user = <User>null;

    before(() => {
      user = new User('testuserid', 'password', 'testusername');
    });

    it('should have a salt', () => {
      should.exist(user.salt);
    });

    it('should have a hash', () => {
      should.exist(user.hash);
    });
  });
});
