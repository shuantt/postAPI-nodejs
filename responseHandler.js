const responseHandler = (res, apiStatus, status, message, respData) => {
  const headers = {
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };

  const respObj = {
    status: status,
    message: message,
    data: respData
  };

  res.writeHead(apiStatus, headers);
  res.write(JSON.stringify(respObj));
  res.end();
};

module.exports = responseHandler;
