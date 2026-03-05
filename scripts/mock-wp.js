const express = require('express');
const app = express();
const PORT = 8080;

app.get('/wp-json/wp/v2/search', (req, res) => {
    // We simulate "Complexity" by checking the search query
    const isComplex = req.query.search.includes('complex');
    const delay = isComplex ? 2000 : 200; // 2 seconds for complex, 200ms for simple

    setTimeout(() => {
        console.log(`[WP-MOCK] 🔋 Served ${isComplex ? '🚨 COMPLEX' : '✅ SIMPLE'} in ${delay}ms`);
        res.json([{ id: 1, title: 'Clinical Data' }]);
    }, delay);
});

app.listen(PORT, () => console.log(`📡 Mock WP running: http://localhost:${PORT}`));