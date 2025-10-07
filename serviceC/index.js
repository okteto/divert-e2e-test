import got from "got";
import express from "express";

const app = express();
const PORT = 8080;


app.get("/", function (req, res) {
  res.send("Service C says hello!");
});

app.get("/chain", async function (req, res) {
  console.log("/chain request");

  console.log("/chain request headers:");
  Object.keys(req.headers).forEach((key) => {
    console.log(`${key}: ${req.headers[key]}`);
  });

  try {
    const message = `Service C says hello from ${process.env.OKTETO_NAMESPACE}!`;
    res.send(message);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, function () {
  console.log("Started service-c server on %d", PORT);
});
