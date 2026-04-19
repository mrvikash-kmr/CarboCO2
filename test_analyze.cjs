const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/analyze', { url: "https://example.com" });
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }
  }
}

test();
