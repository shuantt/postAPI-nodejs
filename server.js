const http = require('http');
const { v4: uuidv4 } = require('uuid');
const responseHandler = require('./responseHandler');
let todolist = [];

const requestListener = (request, response) => {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });

  if (request.url == '/todos' && request.method == 'GET') {
    const respObj = {
      Status: 'success',
      Message: '取得全部代辦事項',
      TodoList: todolist,
    };
    responseHandler(response, 200, JSON.stringify(respObj));
  } else if (request.url == '/todos' && request.method == 'POST') {
    request.on('end', () => {
      try {
        const title = JSON.parse(body).Title;
        const id = uuidv4();
        if (title != undefined) {
          const todo = { ID: id, Title: title };
          todolist.push(todo);
          const respObj = {
            Status: 'success',
            Message: `新增代辦事項成功 ID: ${id}`,
            TodoList: todolist,
          };
          responseHandler(response, 200, JSON.stringify(respObj));
        } else {
          const respObj = {
            Status: 'fail',
            Message: '參數錯誤',
            TodoList: todolist,
          };
          responseHandler(response, 400, JSON.stringify(respObj));
        }
      } catch (err) {
        const respObj = {
          Status: 'fail',
          Message: '參數錯誤',
          TodoList: todolist,
        };
        responseHandler(response, 400, JSON.stringify(respObj));
      }
    });
  } else if (request.url == '/todos' && request.method == 'DELETE') {
    todolist.length = 0;
    const respObj = {
      Status: 'success',
      Message: '刪除全部代辦事項',
      TodoList: todolist,
    };
    responseHandler(response, 200, JSON.stringify(respObj));
  } else if (request.url.startsWith('/todos/') && request.method == 'DELETE') {
    const id = request.url.split('/').pop();
    const index = todolist.findIndex((ele) => ele.ID == id);
    if (index != -1) {
      todolist.splice(index, 1);
      const respObj = {
        Status: 'success',
        Message: `已刪除代辦 ID: ${id}`,
        TodoList: todolist,
      };
      responseHandler(response, 200, JSON.stringify(respObj));
    } else {
      const respObj = {
        Status: 'fail',
        Message: `無此代辦 ID`,
      };
      responseHandler(response, 400, JSON.stringify(respObj));
    }
  } else if (request.url.startsWith('/todos/') && request.method == 'PATCH') {
    request.on('end', () => {
      try {
        const id = request.url.split('/').pop();
        const index = todolist.findIndex((ele) => ele.ID == id);
        const title = JSON.parse(body).Title;
        if (index != -1 && title != undefined) {
          todolist[index].Title = title;
          const respObj = {
            Status: 'success',
            Message: `編輯代辦事項成功 ID: ${id}`,
            TodoList: todolist,
          };
          responseHandler(response, 200, JSON.stringify(respObj));
        } else {
          const respObj = {
            Status: 'fail',
            Message: `參數錯誤，或無此代辦 ID`,
          };
          responseHandler(response, 400, JSON.stringify(respObj));
        }
      } catch (err) {
        const respObj = {
          Status: 'fail',
          Message: `參數錯誤，或無此代辦 ID`,
        };
        responseHandler(response, 400, JSON.stringify(respObj));
      }
    });
  } else if (request.method == 'OPTIONS') {
    response.writeHead(200, headers);
    response.end();
  } else {
    const respObj = {
      Status: 'fail',
      Message: `無此路由`,
    };
    responseHandler(response, 404, JSON.stringify(respObj));
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);
