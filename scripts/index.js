const express = require('express');
const createMiddleware = require('../src/middleware/concurrency-filter');
const GradientLimiter = require('../src/limiters/gradient-limiter');
const MockActuator = require('../src/actuators/mock-actuator');
const { simulateWpResponse } = require('../src/services/wordpress');
const { LIMITER, GCP } = require('../config/constants');

const app = express();
const limiter = new GradientLimiter(LIMITER);
const actuator = new MockActuator(GCP);

// Initialize the Middleware
const orchestrator = createMiddleware(limiter, actuator);

app.get('/api/search', orchestrator, async (req, res) => {
    const isComplex = req.query.complex === 'true';
    const result = await simulateWpResponse(isComplex);
    res.status(result.status).json(result);
});

app.listen(3000, () => {
    console.log('🚀 Local Orchestrator running on http://localhost:3000');
    console.log('Targeting Mock WordPress (Golden Path: 250ms)');
});