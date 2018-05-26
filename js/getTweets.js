let key = "C6nhbatAb4agAWZInshfQp2X5";
let secret = "DCZQbYErJEUMZnKHEcTs2JqPhLCj0e7tGIBzVM6ESJQgWxkEh8";
let tokenEndpoint = "https://api.twitter.com/oauth2/token";
let searchEndpoint = "https://api.twitter.com/1.1/search/tweets.json";
let corsProxy = "https://cors-anywhere.herokuapp.com/";
let closestWithTrendingEndpoint = "https://api.twitter.com/1.1/trends/closest.json";
let trendingForWoeid = "https://api.twitter.com/1.1/trends/place.json";

async function getBearerToken() {
  let credentials = btoa(key + ":" + secret);

  var response = await fetch(corsProxy + tokenEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': "Basic " + credentials,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: "grant_type=client_credentials"
  });

  console.log(response.status);
  if (response.status !== 200) {
    return;
  }

  var data = await response.json();

  return data["access_token"];
}

function Trend(trendName, tweets) {
  this.trendName = trendName;
  this.tweets = tweets;
  var tone;

  Trend.prototype.setTone = function(tone) {
    this.tone = tone;
  };

  Trend.prototype.getTone = function() {
    return tone;
  };
}

async function getTweets(latitude, longitude) {
  let bearerToken =  await getBearerToken();
  console.log(bearerToken);

  var woeid = await getNearestLocationWithTrends(bearerToken);

  var trends = await getTrendsForLocation(bearerToken, woeid);

  return await searchTrendingTweets(bearerToken, trends);
}

async function getNearestLocationWithTrends(bearerToken) {
  var searchString =  "?lat=37.773972&long=-122.431297";

  var response = await fetch(corsProxy + closestWithTrendingEndpoint + searchString, {
    method: 'GET',
    headers: {
      'Authorization': "Bearer " + bearerToken,
    }
  });

  console.log(response.status);
  if (response.status !== 200) {
    return;
  }

  var data = await response.json();

  console.log(data[0].woeid)
  return data[0].woeid;
}

async function getTrendsForLocation(bearerToken, woeid) {
  var searchString = "?id=" + woeid;

  var response = await fetch(corsProxy + trendingForWoeid + searchString, {
    method: 'GET',
    headers: {
      'Authorization': "Bearer " + bearerToken,
    }
  });

  console.log(response.status);
  if (response.status !== 200) {
    return;
  }

  var data = await response.json();

  return data[0].trends;
}

async function searchTrendingTweets(bearerToken, trends) {
  let size = trends.length;

  var searches = [];
  var names = [];

  var results;


  for (var i = 0; i < size && i < 10; i++) {
    searches[i] = searchTweets(bearerToken, trends[i].query);
    names[i] = trends[i]["name"];

    console.log(names[i]);
  }

  await Promise.all(searches).then(res => results = res);

  var trendObjects = [];

  console.log(results[0]);

  for (var j = 0; j < results.length; j++) {
    trendObjects[j] = new Trend(names[j], results[j].map(x => x["full_text"]));
  }

  return trendObjects;
}

async function searchTweets(bearerToken, query) {
  var searchString =  "?q=" + query + "&result_type=mixed&count=100&tweet_mode=extended";

  var response = await fetch(corsProxy + searchEndpoint + searchString, {
    method: 'GET',
    headers: {
      'Authorization': "Bearer " + bearerToken,
    }
  });

  console.log(response.status);
  if (response.status !== 200) {
    return;
  }

  var data = await response.json();

  return data["statuses"];
}

async function searchTweetsGetNext(bearerToken, nextQuery) {
  var response = await fetch(corsProxy + searchEndpoint + nextQuery, {
    method: 'GET',
    headers: {
      'Authorization': "Bearer " + bearerToken,
    }
  });

  console.log(response.status);
  if (response.status !== 200) {
    return;
  }

  let data = await response.json();

  return data;
}
