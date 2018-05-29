const fetchRetry = async (generatePromise, n = 3) => {
  try {
    return await generatePromise()
  } catch(err) {
    if (n === 1) throw err;
    return await fetchRetry(generatePromise, n - 1);
  }
};

export default fetchRetry
