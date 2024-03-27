const responseHandler = (response, apiStatus, jsonResp) => {
  const headers = {
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };

  response.writeHead(apiStatus, headers);
  response.write(jsonResp);
  response.end();
};

module.exports = responseHandler;
