const express = require("express");
const mysql = require("mysql"); //npm install mysql
const path = require("path");
const static = require("serve-static");
const dbconfig = require("./config/dbconfig.json");

//Database connection pool
const poll = mysql.createPool({
  connectionLimit: 10,
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false,
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", static(path.join(__dirname, "public")));

app.post("/process/login", (req, res) => {
  console.log("/process/login 호출됨" + req);
  const paramId = req.body.id;
  const paramPassword = req.body.password;

  console.log("로그인 요청" + paramId + " " + paramPassword);

  pool.getConnection((err, conn) => {
    if (err) {
      conn.release();
      console.log("Mysql getConnection error. aborted");
      res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
      res.write("<h1>DB 연결 실패</h1>");
      res.end();
      return;
    }

    const exec = conn.query(
      "select `id`, `name` from `users` where `id`=? and `password`=password(?)",
      [paramId, paramPassword],
      (err, rows) => {
        conn.release();
        console.log("실행된 SQL query: " + exec.sql);

        if (err) {
          console.dir(err);
          res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
          res.write("<h1>SQL query 실행 실패</h1>");
          res.end();
          return;
        }

        if (rows.length > 0) {
          console.log(
            "아이디[%s], 패스원드가 일치하는 이름 [%s] 찾음",
            paramId
          );
          res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
          res.write("<h2>로그인 성공</h2>");
          return;
        } else {
          console.log(
            "아이디[%s], 패스원드가 일치하는 이름 [%s] 찾음",
            paramId
          );
          res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
          res.write(
            "<h2>로그인 실패. 아이디와 패스워드가 일치하는지 확인하세요.</h2>"
          );
          return;
        }
      }
    );
  });
});

app.post("/process/adduser", (req, res) => {
  console.log("/process/adduser 호출됨" + req);

  const paramId = req.body.id;
  const paramName = req.body.name;
  const paramAge = req.body.age;
  const paramPassword = req.body.password;

  poll.getConnection((err, conn) => {
    if (err) {
      conn.release();
      console.log("Mysql getConnection error. aborted");
      res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
      res.write("<h1>DB 연결 실패</h1>");
      res.end();
      return;
    }

    console.log("데이터베이스 연결 끈 얻었음");

    const exec = conn.query(
      "insert into user(id, name, age, password) values (?,?,?,password(?));",
      [paramId, paramName, paramAge, paramPassword],
      (err, result) => {
        conn.release();
        console.log("실행된 SQL: " + exec.sql);

        if (err) {
          console.log("SQL 실행시 오류 발생");
          console.dir(err);
          res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
          res.write("<h1>SQL query 실행 실패</h1>");
          res.end();
          return;
        }

        if (result) {
          console.dir(result);
          console.log("Inserted 성공");

          res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
          res.write("<h2>사용자 추가 성공</h2>");
          res.end();
        } else {
          console.log("Inserted 실패");

          res.writeHead("200", { "Content-Type": "text/html; charset = utf8" });
          res.write("<h1>사용자 추가 실패</h1>");
          res.end();
        }
      }
    );
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
