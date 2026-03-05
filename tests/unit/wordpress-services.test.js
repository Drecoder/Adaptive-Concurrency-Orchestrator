// tests/unit/wordpress-services.edge.test.js
const createMiddleware = require("../../src/middleware/concurrency-filter");

describe("Concurrency Middleware – Realistic Edge Cases", () => {
  test("Low-priority request rejected exactly at limit", () => {
    const mockActuator = { triggerMigScaleUp: jest.fn() };
    const mockLimiter = { calculate: () => ({ newLimit: 2 }), minRT: 100 };

    const middleware = createMiddleware(mockLimiter, mockActuator);

    const finishCallbacks = [];
    const createRes = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      on: (event, fn) => finishCallbacks.push(fn), // store, don't call yet
    });

    const next = jest.fn();

    // 1st low-priority → allowed
    middleware({ headers: { "x-priority": "low" } }, createRes(), next);

    // 2nd low-priority → allowed
    middleware({ headers: { "x-priority": "low" } }, createRes(), next);

    // 3rd low-priority → should hit limit
    const res3 = createRes();
    middleware({ headers: { "x-priority": "low" } }, res3, next);

    expect(res3.status).toHaveBeenCalledWith(429);
    expect(res3.json).toHaveBeenCalledWith({ error: "Squeezed" });
  });

  test("High-priority triggers scale-up at limit", () => {
    const mockActuator = { triggerMigScaleUp: jest.fn() };
    const mockLimiter = { minRT: 200, calculate: () => ({ newLimit: 1 }) };

    const middleware = createMiddleware(mockLimiter, mockActuator);

    const resFactory = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      on: jest.fn(),
    });

    const next = jest.fn();

    // Fill concurrency to limit with low-priority
    middleware({ headers: { "x-priority": "low" } }, resFactory(), next);

    // Send high-priority request → should bypass and trigger scale-up
    const highReqRes = resFactory();
    middleware({ headers: { "x-priority": "high" } }, highReqRes, next);

    expect(mockActuator.triggerMigScaleUp).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test("Concurrency decrements on res.finish", () => {
    const mockActuator = { triggerMigScaleUp: jest.fn() };
    const mockLimiter = { minRT: 200, calculate: () => ({ newLimit: 3 }) };

    const middleware = createMiddleware(mockLimiter, mockActuator);

    let finishCallbacks = [];
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      on: jest.fn((event, fn) => finishCallbacks.push(fn)),
    };
    const next = jest.fn();

    middleware({ headers: { "x-priority": "low" } }, res, next);
    middleware({ headers: { "x-priority": "low" } }, res, next);

    // simulate finish of first request
    finishCallbacks[0]();

    // Send another request → should succeed
    middleware({ headers: { "x-priority": "low" } }, res, next);

    expect(next).toHaveBeenCalledTimes(3);
  });

  test("Rapid high/low priority requests maintain correct behavior", () => {
    const mockActuator = { triggerMigScaleUp: jest.fn() };
    const mockLimiter = { minRT: 200, calculate: () => ({ newLimit: 2 }) };

    const middleware = createMiddleware(mockLimiter, mockActuator);

    const resFactory = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      on: jest.fn(),
    });
    const next = jest.fn();

    const highReq = { headers: { "x-priority": "high" } };
    const lowReq = { headers: { "x-priority": "low" } };

    // Fill limit with one low-priority
    middleware(lowReq, resFactory(), next);

    // Alternate high/low → high bypasses, low may be squeezed
    middleware(highReq, resFactory(), next);
    middleware(lowReq, resFactory(), next);
    middleware(highReq, resFactory(), next);

    expect(mockActuator.triggerMigScaleUp).toHaveBeenCalled();
  });

  test("Limiter respects numeric edge limits", () => {
    const mockActuator = { triggerMigScaleUp: jest.fn() };
    const mockLimiter = {
      minRT: 100,
      maxLimit: 3,
      calculate: (latency) => ({
        newLimit: latency < 50 ? 5 : 2, // over max / below min
      }),
    };

    const middleware = createMiddleware(mockLimiter, mockActuator);
    const resFactory = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      on: jest.fn(),
    });
    const next = jest.fn();

    middleware(
      { headers: { "x-priority": "low", "x-latency": "30" } },
      resFactory(),
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
