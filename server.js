const express = require("express");
const app = express();

let port = 3000;

app.use(express.static('public'));


// app.get("/", function (req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

app.listen(port, function () {
    console.log("Server running on port "+port);
});
