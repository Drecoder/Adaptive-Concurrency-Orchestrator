/**
 * WORDPRESS SERVICE: The Data Layer
 * Purpose: Fetches from WP-JSON and reports latency to the Logic Engine.
 */
const axios = require('axios');

async function searchClinicalDatabase(query) {
    const start = Date.now();
    try {
        // In your simulation, this targets your local WP or a mock WP endpoint
        const response = await axios.get(`${process.env.WP_API_URL}/wp-json/wp/v2/search`, {
            params: { search: query }
        });
        
        return {
            data: response.data,
            duration: Date.now() - start,
            status: 'success'
        };
    } catch (error) {
        return {
            duration: Date.now() - start,
            status: 'error',
            message: error.message
        };
    }
}

module.exports = { searchClinicalDatabase };