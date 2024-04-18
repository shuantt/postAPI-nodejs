//------------------- module 引用 -------------------
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const responseHandler = require('./responseHandler');
//------------------- 取得環境變數 -------------------
dotenv.config({ path: './config.env' });
//------------------- DB Setting -------------------
const connectionStr = `${process.env.CONNECTION_STR}`
  .replace('<account>', process.env.DB_ACC)
  .replace('<password>', process.env.DB_PASSWORD);
mongoose.connect(connectionStr);
const Post = require('./models/posts');
//------------------- 請求監聽 -------------------
const requestListener = async (request, response) => {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  if (request.url == '/posts' && request.method == 'GET') {
    try {
      const posts = await Post.find({}).select(
        '_id content image name likes createdAt updatedAt'
      );
      responseHandler(response, 200, 'success', '取得全部貼文', posts);
    } catch (err) {
      console.log(err);
      responseHandler(response, 400, 'failed', '參數錯誤', []);
    }
  } else if (request.url == '/posts' && request.method == 'POST') {
    request.on('end', async () => {
      try {
        const content = JSON.parse(body).content;
        const image = JSON.parse(body).image;
        const name = JSON.parse(body).name;
        const likes = JSON.parse(body).likes;
        if (content === undefined || name === undefined) {
          responseHandler(
            response,
            400,
            'failed',
            'content 和 name 為必填',
            []
          );
          return;
        } else if (content === '' || name === '') {
          responseHandler(
            response,
            400,
            'failed',
            'content 和 name 為必填',
            []
          );
          return;
        }
        else{
          const result = await Post.create({
            content: content,
            image: image,
            name: name,
            likes: likes,
          });
          responseHandler(response, 200, 'success', '新增貼文成功', result);
        }
      } catch (err) {
        responseHandler(response, 400, 'failed', '參數錯誤', []);
      }
    });
  } else if (request.url == '/posts' && request.method == 'DELETE') {
    try {
      const result = await Post.deleteMany();
      responseHandler(
        response,
        200,
        'success',
        `已刪除全部共 ${result.deletedCount} 貼文`,
        []
      );
    } catch (err) {
      responseHandler(response, 400, 'failed', '參數錯誤', []);
    }
  } else if (request.url.startsWith('/posts/') && request.method == 'DELETE') {
    const id = request.url.split('/').pop();
    try {
      const result = await Post.findByIdAndDelete(id);
      if (result === null) {
        responseHandler(response, 400, 'failed', '無此 id', []);
      } else {
        responseHandler(
          response,
          200,
          'success',
          `貼文 ${result._id} 已刪除`,
          result
        );
      }
    } catch (err) {
      responseHandler(response, 400, 'failed', '參數錯誤或無此 id', []);
    }
  } else if (request.url.startsWith('/posts/') && request.method == 'PATCH') {
    request.on('end', async () => {
      try {
        const id = request.url.split('/').pop();
        const content = JSON.parse(body).content;
        const name = JSON.parse(body).name;
        const image = JSON.parse(body).image;
        const likes = JSON.parse(body).likes;
        if (content === '' || name === '') {
          responseHandler(
            response,
            400,
            'failed',
            'content 和 name 不可為空',
            []
          );
          return;
        } else {
          const result = await Post.findByIdAndUpdate(
            id,
            { content: content, name: name, image: image, likes: likes },
            { returnDocument: 'after' }
          );
          if (result === null) {
            responseHandler(response, 400, 'failed', '無此 id', []);
          } else {
            responseHandler(
              response,
              200,
              'success',
              `貼文 ${result._id} 已更新`,
              result
            );
          }
        }
      } catch (err) {
        responseHandler(response, 400, 'failed', '參數錯誤或無此 id', []);
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
