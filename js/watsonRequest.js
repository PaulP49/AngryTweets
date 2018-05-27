let watsonUser = "6585c43d-a9c4-4770-90fb-dc5fe7d69303";
let watsonPassword = "LGe40dnUh7Oh";
let watsonTokenEndpoint = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";

var joyArray;
var angryArray;
var sadnessArray;
var fearArray;
var analyticalArray;
var tentativeArray;
var criticalArray;

var joyAverage;
var angryAverage;
var sadnessAverage;
var fearAverage;
var analyticalAverage;
var tentativeAverage;
var criticalAverage;

async function analyzeText(tweetObject) {
  let requests = [];
  var results = [];
  for (var trendIndex = 0; trendIndex < tweetObject.trend.length; trendIndex++) {
    requests[trendIndex] = watsonRequest(tweetObject.trend[trendIndex]);
  }

  await Promise.all(requests).then(res => results = res);
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

async function watsonRequest(trend) {


  var text = buidText(trend.tweets);

  console.log("send  watson request...");
  let watsonCredentials = btoa(watsonUser + ":" + watsonPassword);

  var errorHappened = false;
  var response;

  response = await fetch("https://cors-anywhere.herokuapp.com/" + watsonTokenEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': "Basic " + watsonCredentials,
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({text: text})
  }).then(res => {
    if (!res.ok) {
      console.log("testError");
      errorHappened = true;
    }
    return res;
  });



  if (errorHappened) {
    response = await fetch("https://cors-anywhere.herokuapp.com/" + watsonTokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': "Basic " + watsonCredentials,
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({text: text})
    });
  }

  console.log(response.status);

  var data = await response.json();
  console.log(data);
  console.log(response);

  extractScores(data);

  let toneobj = createNewToneObject();
  trend.setTone(toneobj);
  console.log(trend.getTone());
}

function buidText(tweetArray) {
  var text = "";
  for (var i = 0; i < tweetArray.length; i++) {
    text += tweetArray[i] +"\n";
  }

  return text;
}

function extractScores(data) {
  joyArray = [];
  angryArray = [];
  sadnessArray = [];
  fearArray = [];
  analyticalArray = [];
  tentativeArray = [];
  criticalArray = [];

  joyAverage = 0;
  angryAverage = 0;
  sadnessAverage = 0;
  fearAverage = 0;
  analyticalAverage = 0;
  tentativeAverage = 0;
  criticalAverage = 0;

  var tweetCounter = 0;

  for (var sentenceIndex = 0; sentenceIndex < data.sentences_tone.length; sentenceIndex++) {
    var counterIncFlag = false;
    for (var toneIndex = 0; toneIndex < data.sentences_tone[sentenceIndex].tones.length; toneIndex++) {
      var toneObject = data.sentences_tone[sentenceIndex].tones[toneIndex];
      if (toneObject.tone_id === "joy") {
        console.log("added " +toneObject.score +" to joyArray");
        joyArray.push(toneObject.score);
        if (!counterIncFlag) {
          tweetCounter++;
          counterIncFlag = true;
        }
      } if (toneObject.tone_id === "anger") {
        console.log("added " +toneObject.score +" to angryArray");
        angryArray.push(toneObject.score);
        if (!counterIncFlag) {
          tweetCounter++;
          counterIncFlag = true;
        }
      } if (toneObject.tone_id === "fear") {
        console.log("added " +toneObject.score +" to fearArray");
        fearArray.push(toneObject.score);
        if (!counterIncFlag) {
          tweetCounter++;
          counterIncFlag = true;
        }
      } if (toneObject.tone_id === "sadness") {
        console.log("added " +toneObject.score +" to sadnessArray");
        sadnessArray.push(toneObject.score);
        if (!counterIncFlag) {
          tweetCounter++;
          counterIncFlag = true;
        }
      } if (toneObject.tone_id === "analytical") {
        console.log("added " +toneObject.score +" to analyticalArray");
        analyticalArray.push(toneObject.score);
        if (!counterIncFlag) {
          tweetCounter++;
          counterIncFlag = true;
        }
      } if (toneObject.tone_id === "tentative") {
        console.log("added " +toneObject.score +" to tentativeArray");
        tentativeArray.push(toneObject.score);
        if (!counterIncFlag) {
          tweetCounter++;
          counterIncFlag = true;
        }
      } if (toneObject.tone_id === "critical") {
        console.log("added " +toneObject.score +" to criticalArray");
        criticalArray.push(toneObject.score);
        if (!counterIncFlag) {
          tweetCounter++;
          counterIncFlag = true;
        }
      }
    }
  }
  computeAverageValues(tweetCounter);
}

function computeAverageValues(tweetCount) {
  joyAverage = computeAverage(joyArray, tweetCount);
  console.log("joyAverage: " +joyAverage);
  angryAverage = computeAverage(angryArray, tweetCount);
  console.log("angryAverage: " +angryAverage);
  sadnessAverage = computeAverage(sadnessArray, tweetCount);
  console.log("sadnessAverage: " +sadnessAverage);
  fearAverage = computeAverage(fearArray, tweetCount);
  console.log("fearAverage: " +fearAverage);
  analyticalAverage = computeAverage(analyticalArray, tweetCount);
  console.log("analyticalAverage: " +analyticalAverage);
  tentativeAverage = computeAverage(tentativeArray, tweetCount);
  console.log("tentativeAverage: " +tentativeAverage);
  criticalAverage = computeAverage(criticalArray, tweetCount);
  console.log("criticalAverage: " +criticalAverage);
}

function computeAverage(array, tweetCount) {
  var average = 0.0;

  for (var i = 0; i < array.length; i++) {
    average += array[i];
  }

  return average / tweetCount;
}

function createNewToneObject() {
  return new ToneObject(joyAverage, angryAverage, fearAverage, sadnessAverage, analyticalAverage, tentativeAverage, criticalAverage);
}














