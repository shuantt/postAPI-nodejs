//------------------- module 引用 -------------------
const http = require('http');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const { v4: uuidv4 } = require('uuid');
const responseHandler = require('./responseHandler');

//------------------- 資料庫連線 -------------------
const uri = process.env.CONNECTION_STR.replace(
  '<account>',
  process.env.MONGO_ACC
).replace('<password>', process.env.MONGO_PASSWORD);

mongoose
  .connect(uri)
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch((error) => {
    console.log(error);
  });

  //建立 Todo 的 Schema
  const todoSchema = new Schema({
    title: {
      type: String,
      require:[true,"事項 title 必填"]
    },
    status: Boolean,
    createDate: Date, 
    updateDate: Date
  });

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
    request.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title != undefined) {
          const Todo = mongoose.model('Todo', todoSchema);
          const todo = new Todo({
            title: title,
            createDate: Date.now(),
            updateDate: null,
          });
          todo.save().then(()=>{
            console.log('新增成功');
          }).catch((error)=>{
            console.log('新增失敗');
          });

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
