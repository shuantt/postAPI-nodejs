//------------------- module 引用 -------------------
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const responseHandler = require('./responseHandler');
//------------------- 取得環境變數 -------------------
dotenv.config({path: './config.env'});
//------------------- DB Setting -------------------
const connectionStr = `${process.env.CONNECTION_STR}`
  .replace('<account>', process.env.DB_ACC)
  .replace('<password>', process.env.DB_PASSWORD);
mongoose.connect(connectionStr);
const Todo = require('./models/todo');
//------------------- 請求監聽 -------------------
const requestListener = async (request, response) => {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  if (request.url == '/todos' && request.method == 'GET') {
    try {
      const todos = await Todo.find({}).select(
        '_id title completed tags createdAt updatedAt'
      );
      responseHandler(response, 200, 'success', '取得全部代辦事項', todos);
    } catch (err) {
      console.log(err);
      responseHandler(response, 400, 'failed', '參數錯誤', []);
    }
  } else if (request.url == '/todos' && request.method == 'POST') {
    request.on('end', async () => {
      try {
        const title = JSON.parse(body).title;
        const completed = JSON.parse(body).completed;
        const tags = JSON.parse(body).tags;
        if (title !== undefined && title === '') {
          responseHandler(response, 400, 'failed', 'title 不可為空', []);
          return;
        }
        const result = await Todo.create({
          title: title,
          completed: completed,
          tags: tags,
        });
        responseHandler(response, 200, 'success', '新增代辦事項成功', result);
      } catch (err) {
        responseHandler(response, 400, 'failed', '參數錯誤', []);
      }
    });
  } else if (request.url == '/todos' && request.method == 'DELETE') {
    try {
      const result = await Todo.deleteMany();
      responseHandler(
        response,
        200,
        'success',
        `已刪除全部共 ${result.deletedCount} 項代辦`,
        []
      );
    } catch (err) {
      responseHandler(response, 400, 'failed', '參數錯誤', []);
    }
  } else if (request.url.startsWith('/todos/') && request.method == 'DELETE') {
    const id = request.url.split('/').pop();
    try {
      const result = await Todo.findByIdAndDelete(id);
      if (result === null) {
        responseHandler(response, 400, 'failed', '無此代辦 id', []);
      } else {
        responseHandler(
          response,
          200,
          'success',
          `代辦事項 ${result._id} 已刪除`,
          result
        );
      }
    } catch (err) {
      responseHandler(response, 400, 'failed', '參數錯誤或無此代辦 id', []);
    }
  } else if (request.url.startsWith('/todos/') && request.method == 'PATCH') {
    request.on('end', async () => {
      try {
        const id = request.url.split('/').pop();
        const title = JSON.parse(body).title;
        const tags = JSON.parse(body).tags;
        const completed = JSON.parse(body).completed;
        if (title !== undefined && title === '') {
          responseHandler(response, 400, 'failed', 'title 不可為空', []);
          return;
        }
        const result = await Todo.findByIdAndUpdate(
          id,
          { title: title, completed: completed, tags: tags },
          { returnDocument:'after' }
        );
        if (result === null) {
          responseHandler(response, 400, 'failed', '無此代辦 id', []);
        } else {
          responseHandler(
            response,
            200,
            'success',
            `代辦事項 ${result._id} 已更新`,
            result
          );
        }
      } catch (err) {
        responseHandler(response, 400, 'failed', '參數錯誤或無此代辦 id', []);
      }
    });
  } else if (request.method == 'OPTIONS') {
    response.writeHead(200, headers);
    response.end();
  } else {
    responseHandler(response, 404, 'failed', '無此路由', []);
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);
