const {jwtModel} = require('../authRoute/authModels.js');
const jwt = require('jsonwebtoken');
const chai = require('chai');

const expect = chai.expect;
describe('it gets token', () => {
    it('works', () => {
        const username = "username"; 
        const firstName = "firsrtname";
        const lastName = "whatever";
        const token = jwt.sign(
            {
              user: {
                username,
                firstName,
                lastName
              }
            },
            'secret',
            {
              algorithm: 'HS256',
              subject: username,
              expiresIn: '7d'
            }
          );
        const result = jwtModel._jwtFromRequest({headers: {
            'authorization': 'Bearer 123'
        }});
        expect(result).to.equals('123')
    })
})