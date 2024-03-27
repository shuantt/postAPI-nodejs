const http = require('http');
const { v4: uuidv4 } = require('uuid');

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
  'Content-Type': 'application/json',
};

let todolist = [];

const requestListener = (request, response) => {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });

  if (request.url == '/todos' && request.method == 'GET') {
    const resp = {
      status: 'success',
      message: '取得全部代辦事項',
      todolist: todolist,
    };
    response.writeHead(200, headers);
    response.write(JSON.stringify(resp));
    response.end();
  } else if (request.url == '/todos' && request.method == 'POST') {
    request.on('end', () => {
      try {
        const title = JSON.parse(body).Title;
        const id = uuidv4();
        if (title != undefined) {
          const todo = { ID: id, Title: title };
          todolist.push(todo);
          const resp = {
            status: 'success',
            message: `新增代辦事項成功 ID: ${id}`,
            todolist: todolist,
          };
          response.writeHead(200, headers);
          response.write(JSON.stringify(resp));
          response.end();
        } else {
          const resp = {
            status: 'fail',
            message: `參數錯誤`,
            todolist: todolist,
          };
          response.writeHead(400, headers);
          response.write(JSON.stringify(resp), err.message);
          response.end();
        }
      } catch (err) {
        const resp = {
          status: 'fail',
          message: `參數錯誤`,
          todolist: todolist,
        };
        response.writeHead(400, headers);
        response.write(JSON.stringify(resp), err.message);
        response.end();
      }
    });
  } else if (request.url == '/todos' && request.method == 'DELETE') {
    todolist.length = 0;
    const resp = {
      status: 'success',
      message: '刪除全部代辦事項',
      todolist: todolist,
    };
    response.writeHead(200, headers);
    response.write(JSON.stringify(resp));
    response.end();
  } else if (request.url.startsWith('/todos/') && request.method == 'DELETE') {
    const id = request.url.split('/').pop();
    const index = todolist.findIndex((ele) => ele.ID == id);
    if (index != -1) {
      todolist.splice(index, 1);
      const resp = {
        status: 'success',
        message: `已刪除代辦 ID: ${id}`,
        todolist: todolist,
      };
      response.writeHead(200, headers);
      response.write(JSON.stringify(resp));
      response.end();
    } else {
      const resp = {
        status: 'fail',
        message: `無此代辦 ID`,
      };
      response.writeHead(400, headers);
      response.write(JSON.stringify(resp));
      response.end();
    }
  } else if (request.url.startsWith('/todos/') && request.method == 'PATCH') {
    request.on('end', () => {
      try {
        const id = request.url.split('/').pop();
        const index = todolist.findIndex((ele) => ele.ID == id);
        const title = JSON.parse(body).Title;
        if (index != -1 && title != undefined) {
          todolist[index].Title = title;
          const resp = {
            status: 'success',
            message: `編輯代辦事項成功 ID: ${id}`,
            todolist: todolist,
          };
          response.writeHead(200, headers);
          response.write(JSON.stringify(resp));
          response.end();
        } else {
          const resp = {
            status: 'fail',
            message: `參數錯誤，或無此代辦 ID`,
          };
          response.writeHead(400, headers);
          response.write(JSON.stringify(resp));
          response.end();
        }
      } catch (err) {
        const resp = {
          status: 'fail',
          message: `參數錯誤，或無此代辦 ID`,
        };
        response.writeHead(400, headers);
        response.write(JSON.stringify(resp));
        response.end();
      }
    });
  } else if (request.method == 'OPTIONS') {
    response.writeHead(200,headers);
    response.end();
  } else {
    const resp = {
      status: 'fail',
      message: `無此路由`,
    };
    response.writeHead(404, headers);
    response.write(JSON.stringify(resp));
    response.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);
