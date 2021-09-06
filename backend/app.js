const express = require("express");
const app = express();

const errorMiddleware = require("./middleware/errors");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const content = require("./routes/content");

app.use("/api", content);

app.use(errorMiddleware);

module.exports = app;
