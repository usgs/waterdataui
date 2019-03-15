const createPool = require('./puppeteer-pool');


const getState = function ({ size, available, pending, max, min }) {
    const state = { size, available, pending, max, min };
    return state;
}

const inUse = function ({ size, available }) {
    return size - available;
}

describe('Puppeteer pool', function () {
    let pool;

    beforeEach(async function () {
        pool = createPool({
            min: 0,
            max: 3
        });
    });

    afterEach(async function () {
        await pool.drain();
        pool.clear();
    });

    it('create pool', async function () {
        const instance = await pool.acquire();
        const page = await instance.newPage();
        const viewportSize = await page.viewport();
        expect(viewportSize.width).toEqual(800);
        expect(viewportSize.height).toEqual(600);
        await pool.release(instance);
    });

    it('create some pools', async function () {
        const instances = await Promise.all([
            pool.acquire(),
            pool.acquire(),
            pool.acquire()
        ]);
        expect(getState(pool)).toEqual({
            available: 0,
            pending: 0,
            max: 3,
            min: 0,
            size: 3,
        });
        const [firstInstance, ...otherInstances] = instances;
        await pool.release(firstInstance);
        expect(getState(pool)).toEqual({
            available: 1,
            pending: 0,
            max: 3,
            min: 0,
            size: 3
        });
        await Promise.all(otherInstances.map(function (instance) {
            return pool.release(instance);
        }));
        expect(getState(pool)).toEqual({
            available: 3,
            pending: 0,
            max: 3,
            min: 0,
            size: 3
        });
    });

    it('use', async function () {
        expect(inUse(pool)).toEqual(0);
        const result = await pool.use(async function (instance) {
            expect(inUse(pool)).toEqual(1);
            const page = await instance.newPage();
            return await page.evaluate('navigator.userAgent');
        });
        expect(result).not.toBe(null);
        expect(inUse(pool)).toEqual(0);
    });

    it('use and throw', async function () {
        expect(inUse(pool)).toEqual(0);
        try {
            await pool.use(async function () {
                expect(inUse(pool)).toEqual(1);
                throw new Error('some err');
            });
        } catch (err) {
            expect(err.message, 'som).toEqual(err');
        }
        expect(inUse(pool)).toEqual(0);
    });

    it('destroy pool', async function () {
        await pool.drain();
        return pool.clear();
    });
});
