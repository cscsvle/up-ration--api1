const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const { number, district } = req.query;

  if (!number || !district) {
    return res.status(400).json({ error: "number और district दोनों पास करो" });
  }

  try {
    const url = https://fcs.up.gov.in/Food/citizen/DisplayAll_RationCard.aspx?ID=${number}&DistName=${district};
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const name = $("#ctl00_ContentPlaceHolder1_lblname").text().trim();
    const members = [];

    $("#ctl00_ContentPlaceHolder1_gvfamily tr").each((i, row) => {
      if (i === 0) return;
      const cols = $(row).find("td");
      const memberName = $(cols[1]).text().trim();
      if (memberName) members.push(memberName);
    });

    if (!name || members.length === 0) {
      return res.status(404).json({ error: "कोई डाटा नहीं मिला, नंबर या जिला गलत हो सकता है" });
    }

    return res.json({
      number,
      district,
      name,
      members
    });
  } catch (error) {
    return res.status(500).json({ error: "डाटा निकालने में दिक्कत आई" });
  }
});

app.listen(port, () => {
  console.log(Server running on port ${port});
});
