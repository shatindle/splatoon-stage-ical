const https = require("https");
const express = require("express");
const ical = require("ical-generator");
const moment = require("moment");

const app = express();
const port = 3000;

const turfCalendar = ical({
  domain: "turf.rsplatoon.com",
  name: "Splatoon Turf War Schedule",
});

const rankedCalendar = ical({
  domain: "turf.rsplatoon.com",
  name: "Splatoon Ranked Schedule",
});

const leagueCalendar = ical({
  domain: "turf.rsplatoon.com",
  name: "Splatoon League Schedule",
});

function updateCalendar(data, calendar) {
  calendar.clear();
  for (var i = 0; i < data.length; i++) {
    var activity = data[i];
    calendar.createEvent({
      start: moment.unix(activity.start_time),
      end: moment.unix(activity.end_time),
      summary: activity.rule.name,
      description:
        activity.rule.name +
        "\n" +
        "\n" +
        "Stages:" +
        "\n" +
        activity.stage_a.name +
        "\n" +
        activity.stage_b.name +
        "\n",
    });
  }
}

function getCalendarData() {
  var options = {
    hostname: "splatoon2.ink",
    path: "/data/schedules.json",
    headers: {
      "User-Agent": "Discord user shane#1353 in https://discord.gg/rsplatoon",
    },
  };

  https.get(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      var allData = JSON.parse(data);

      updateCalendar(allData.regular, turfCalendar);
      updateCalendar(allData.gachi, rankedCalendar);
      updateCalendar(allData.league, leagueCalendar);
    });
  });
}

setInterval(getCalendarData, 3600000);

getCalendarData();

app.get("/", (req, res) =>
  res.send(
    "<!DOCTYPE html><html><header></header>" +
      "<body><h2>Calendars:</h2><ul><li>/turf</li><li>/ranked</li><li>/league</li></ul></body></html>"
  )
);

app.get("/turf", (req, res) => turfCalendar.serve(res));

app.get("/ranked", (req, res) => rankedCalendar.serve(res));

app.get("/league", (req, res) => leagueCalendar.serve(res));

app.listen(port, () => console.log(`Listening on port ${port}`));
