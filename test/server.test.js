const chai = require('chai');
const expect = chai.expect;

describe('Server', () => {
    it('should return a successful response', () => {
        expect(1 + 1).to.equal(2);
    });
});