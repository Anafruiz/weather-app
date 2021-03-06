const express = require("express");
const app = express();
const https = require("https");
const bodyparser = require("body-parser");
const { path } = require("path");
app.use(bodyparser.urlencoded({ extended: true }));
const Database = require("better-sqlite3");
app.use("/stylesheets", express.static(__dirname + "/stylesheets"));
const apikey = "7108838b20074b030ab798854f3c4e0d";
const url =
  "https://api.openweathermap.org/data/2.5/weather?q=dublin&appid=" +
  apikey +
  "&units=metric";

//DATABASE
const db = new Database("./database.db", {
  verbose: console.log,
});
//SET TEMPLATE
app.set("view engine", "ejs");
const staticServerPath = "./";
app.use(express.static(staticServerPath));
const serverPort = process.env.PORT || 3000;
app.listen(serverPort, function () {
  console.log("the server has started at port 3000");
});
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});
app.post("/weather", function (req, response) {
  //get current date
  const date = new Date().toISOString();
  //add city to database
  const query = db.prepare("INSERT INTO cities(searchedAt,city) VALUES(?,?)");
  //RUN QUERY
  console.log(req.body);
  const queryResult = query.run(
    //add date
    date,
    //add city
    req.body.cityname
  );
  //  response.json({
  //   result: "City created",
  //   userId: queryResult.lastInsertRowid,
  //  });
  const apikey = "7108838b20074b030ab798854f3c4e0d";
  let cityName = req.body.cityname;
  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    apikey +
    "&lang=es" +
    "&units=metric";

  //CALL API

  https.get(url, function (res) {
    res.on("data", function (data) {
      let weatherinfo = JSON.parse(data);
      // let weather = weatherinfo.weather[0].main;
      if (weatherinfo.cod === 200) {
        let description = weatherinfo.weather[0].description;
        let temperature = weatherinfo.main.temp;
        let icon = weatherinfo.weather[0].icon;
        let imgURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
        let place = weatherinfo.name;
        const pic = {
          img: "https://openweathermap.org/img/wn/" + icon + "@2x.png",
        };

        // response.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" });
        response.render("pages/weather", weatherinfo);
      } else {
        response.render("pages/nocity");

        // response.write("<h1>" + "Esta ciudad no existe " + "</h1>");
      }
    });
  });
});
