const should = require('should');

describe('Shared model definitions', () => {
    it('should add connection names as namespaces to the default object', (done) => {
        should.exist(Group);
        should.exist(Image);
        should.exist(User);

        should.exist(Group['somePostgresqlServer']);
        should.exist(Image['somePostgresqlServer']);
        should.exist(User['somePostgresqlServer']);

        should.exist(Group['anotherPostgresqlServer']);
        should.exist(Image['anotherPostgresqlServer']);
        should.exist(User['anotherPostgresqlServer']);

        done();
    });
});
