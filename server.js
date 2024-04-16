//------------------- module 引用 -------------------
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const responseHandler = require('./responseHandler');

//------------------- 請求監聽 -------------------
const requestListener = (request, response) => {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  if (request.url == '/todos' && request.method == 'GET') {
    const respObj = {
      status: 'success',
      message: '取得全部代辦事項',
      todoList: todolist,
    };
    responseHandler(response, 200, JSON.stringify(respObj));
  } else if (request.url == '/todos' && request.method == 'POST') {
    request.on('end', async () => {
      try {
        const title = JSON.parse(body).title;
        if (title != undefined) {
          const respObj = {
            status: 'success',
            message: `新增代辦事項成功`,
          };
          responseHandler(response, 200, JSON.stringify(respObj));
        } else {
          const respObj = {
            status: 'fail',
            message: '參數錯誤',
          };
          responseHandler(response, 400, JSON.stringify(respObj));
        }
      } catch (err) {
        const respObj = {
          status: 'fail',
          message: '參數錯誤' + err,
        };
        responseHandler(response, 400, JSON.stringify(respObj));
      }
    });
  } else if (request.url == '/todos' && request.method == 'DELETE') {
    todolist.length = 0;
    const respObj = {
      status: 'success',
      message: '刪除全部代辦事項',
      todoList: todolist,
    };
    responseHandler(response, 200, JSON.stringify(respObj));
  } else if (request.url.startsWith('/todos/') && request.method == 'DELETE') {
    const id = request.url.split('/').pop();
    const index = todolist.findIndex((ele) => ele.ID == id);
    if (index != -1) {
      todolist.splice(index, 1);
      const respObj = {
        status: 'success',
        message: `已刪除代辦 ID: ${id}`,
        todoList: todolist,
      };
      responseHandler(response, 200, JSON.stringify(respObj));
    } else {
      const respObj = {
        status: 'fail',
        message: `無此代辦 ID`,
      };
      responseHandler(response, 400, JSON.stringify(respObj));
    }
  } else if (request.url.startsWith('/todos/') && request.method == 'PATCH') {
    request.on('end', () => {
      try {
        const id = request.url.split('/').pop();
        const index = todolist.findIndex((ele) => ele.ID == id);
        const title = JSON.parse(body).title;
        if (index != -1 && title != undefined) {
          todolist[index].title = title;
          const respObj = {
            status: 'success',
            message: `編輯代辦事項成功 ID: ${id}`,
            todoList: todolist,
          };
          responseHandler(response, 200, JSON.stringify(respObj));
        } else {
          const respObj = {
            status: 'fail',
            message: `參數錯誤，或無此代辦 ID`,
          };
          responseHandler(response, 400, JSON.stringify(respObj));
        }
      } catch (err) {
        const respObj = {
          status: 'fail',
          message: `參數錯誤，或無此代辦 ID`,
        };
        responseHandler(response, 400, JSON.stringify(respObj));
      }
    });
  } else if (request.method == 'OPTIONS') {
    response.writeHead(200, headers);
    response.end();
  } else {
    const respObj = {
      status: 'fail',
      message: `無此路由`,
    };
    responseHandler(response, 404, JSON.stringify(respObj));
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);
