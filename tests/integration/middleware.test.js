const createMiddleware = require('../../src/middleware/concurrency-filter');

describe('Priority Middleware Gate', () => {
    test('should allow high priority even when at concurrency limit', async () => {
        const mockActuator = { triggerMigScaleUp: jest.fn() };
        const mockLogic = { calculate: () => ({ newLimit: 1 }) }; // low limit to trigger scale
        const middleware = createMiddleware(mockLogic, mockActuator);

        const req = { headers: { 'x-priority': 'high' } };
        const res = { on: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        // First request increments concurrency to 1
        await middleware(req, res, next);

        // Second request triggers the "over limit" condition
        await middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(2); // Both requests went through
        expect(mockActuator.triggerMigScaleUp).toHaveBeenCalled(); // Scale signal sent
    });
});