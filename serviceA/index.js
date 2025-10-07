import got from "got";
import express from "express";

const baggageHeader = "baggage";
const app = express();
const PORT = 8080;

function getBaggageHeader(headers) {
  if (headers && headers[baggageHeader]) {
    return headers[baggageHeader];
  }

  return undefined;
}

function buildHeaders(headers) {
  var options = { headers: {} };
  const baggage = getBaggageHeader(headers);
  if (baggage) {
    options.headers[baggageHeader] = baggage;
    //add other headers that you might need to propagate
  }

  return options;
}

function buildTargetServiceUrl(headers) {
  // by default, route the request to the service on the current namespace.
  return `http://serviceb:8080/chain`;
}

async function callDownstreamService(headers) {
  // propagate the baggage headers to allow the receiving service to make runtime decisions
  console.log(`calling downstream service with headers:`);

  Object.keys(headers).forEach((key) => {
    console.log(`${key}: ${headers[key]}`);
  });

  const serviceUrl = buildTargetServiceUrl(headers);
  const options = buildHeaders(headers);

  console.log(
    `calling ${serviceUrl} with headers: ${JSON.stringify(options.headers)}`,
  );

  return await got(serviceUrl, options).text();
}

app.get("/", function (req, res) {
  res.send("Service A says hello!");
});

app.get("/chain", async function (req, res) {
  console.log("/chain request");

  console.log("/chain request headers:");
  Object.keys(req.headers).forEach((key) => {
    console.log(`${key}: ${req.headers[key]}`);
  });

  try {
    const data = await callDownstreamService(req.headers);
    const message = `Service A says hello from ${process.env.OKTETO_NAMESPACE}! <br />`;
    res.send(message + data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, function () {
  console.log(
    `Started service-A server on %d\nCall https://servicea-${process.env.OKTETO_NAMESPACE}.${process.env.OKTETO_DOMAIN}/chain to try me out`,
    PORT,
  );
});
