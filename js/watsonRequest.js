let watsonUser = "6585c43d-a9c4-4770-90fb-dc5fe7d69303";
let watsonPassword = "LGe40dnUh7Oh";
let watsonTokenEndpoint = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";

var joyArray;
var angryArray;
var sadnessArray;
var fearArray;

var joyAverage;
var angryAverage;
var sadnessAverage;
var fearAverage;

async function analyzeText(tweetObject) {
  for (var trendIndex = 0; trendIndex < tweetObject.trend.length; trendIndex++) {
    await watsonRequest(tweetObject.trend[trendIndex]);
  }
}

async function watsonRequest(trend) {


  var text = buidText(trend.tweets);

  console.log("send  watson request...");
  let watsonCredentials = btoa(watsonUser + ":" + watsonPassword);

  var response = await fetch("https://cors-anywhere.herokuapp.com/" + watsonTokenEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': "Basic " + watsonCredentials,
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({text: text})
  });


  console.log(response.status);

  var data = await response.json();
  console.log(data);
  console.log(response);

  extractScores(data);
  let toneobj = createNewToneObject();
  console.log(toneobj);
  trend.setTone(toneobj);
  console.log(trend.getTone());
  console.log("new tone object created: " +trend.getTone().sadnessAverage);
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

  joyAverage = 0;
  angryAverage = 0;
  sadnessAverage = 0;
  fearAverage = 0;

  for (var sentenceIndex = 0; sentenceIndex < data.sentences_tone.length; sentenceIndex++) {
    for (var toneIndex = 0; toneIndex < data.sentences_tone[sentenceIndex].tones.length; toneIndex++) {
      var toneObject = data.sentences_tone[sentenceIndex].tones[toneIndex];
      if (toneObject.tone_id === "joy") {
        console.log("added " +toneObject.score +" to joyArray");
        joyArray.push(toneObject.score);
      } if (toneObject.tone_id === "anger") {
        console.log("added " +toneObject.score +" to angryArray");
        angryArray.push(toneObject.score);
      } if (toneObject.tone_id === "fear") {
        console.log("added " +toneObject.score +" to fearArray");
        fearArray.push(toneObject.score);
      } if (toneObject.tone_id === "sadness") {
        console.log("added " +toneObject.score +" to sadnessArray");
        sadnessArray.push(toneObject.score);
      }
    }
  }
  computeAverageValues();

}

function computeAverageValues() {
  joyAverage = computeAverage(joyArray);
  console.log("joyAverage: " +joyAverage);
  angryAverage = computeAverage(angryArray);
  console.log("angryAverage: " +angryAverage);
  sadnessAverage = computeAverage(sadnessArray);
  console.log("sadnessAverage: " +sadnessAverage);
  fearAverage = computeAverage(fearArray);
  console.log("fearAverage: " +fearAverage);
}

function computeAverage(array) {
  var average = 0.0;

  for (var i = 0; i < array.length; i++) {
    average += array[i];
  }

  return average / array.length;
}

function createNewToneObject() {
  return new ToneObject(joyAverage, angryAverage, fearAverage, sadnessAverage);
}














