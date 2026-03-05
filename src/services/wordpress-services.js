// src/services/wordpress-services.js (mocked for offline demo)
console.log("⚡ WordPress Service (mocked)");

async function searchClinicalDatabase(query) {
  // Simulate a short delay
  await new Promise((r) => setTimeout(r, Math.random() * 100 + 50));

  // Return a fake successful response
  return {
    data: [
      { id: 1, title: `Demo Result for "${query}"` },
      { id: 2, title: `Another Demo Result for "${query}"` }
    ],
    duration: Math.floor(Math.random() * 100) + 50,
    status: 'success'
  };
}

module.exports = { searchClinicalDatabase };