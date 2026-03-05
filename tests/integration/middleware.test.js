const createMiddleware = require('../../src/middleware/concurrency-filter');

describe('Priority Middleware Gate', () => {
    test('should allow high priority even when at concurrency limit', async () => {
        const mockActuator = { triggerMigScaleUp: jest.fn() };
        const mockLogic = { calculate: () => ({ newLimit: 5 }) };
        const middleware = createMiddleware(mockLogic, mockActuator);

        const req = { headers: { 'x-priority': 'high' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        // Simulate being over the limit
        await middleware(req, res, next);
        
        expect(next).toHaveBeenCalled(); // Priority bypass worked
        expect(mockActuator.triggerMigScaleUp).toHaveBeenCalled(); // Scale signal sent
    });
});