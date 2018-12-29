import assert from 'assert';

describe('The format function tests', () => {
    it('is format function working well', () => {
        assert.equal(
            'hello {}'.format(undefined) + '{} fun world'.format('nice'),
            'hello nice fun world'
        );
    });
});
