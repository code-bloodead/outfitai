const axios = require('axios');

exports.fetchImageBlob = async (url) => {
  const imageBlob = await (await fetch(url)).blob();
  return imageBlob;
}
