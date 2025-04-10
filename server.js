const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: "कृपया राशन कार्ड नंबर दें।" });
  }

  const url = "https://nfsa.gov.in/public/frmPublicGetMyRCDetails.aspx";

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const viewstate = $("#__VIEWSTATE").val();
    const eventvalidation = $("#__EVENTVALIDATION").val();
    const viewstategenerator = $("#__VIEWSTATEGENERATOR").val();

    const formData = new URLSearchParams();
    formData.append("__VIEWSTATE", viewstate);
    formData.append("__VIEWSTATEGENERATOR", viewstategenerator);
    formData.append("__EVENTVALIDATION", eventvalidation);
    formData.append("ddlState", "33"); // UP
    formData.append("txtRationCard", number);
    formData.append("btnSearch", "Search");

    const { data: resultPage } = await axios.post(url, formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const $$ = cheerio.load(resultPage);
    const table = $$("#ctl00_ContentPlaceHolder1_gvRCDtls");

    if (table.length === 0) {
      return res.json({ error: "राशन कार्ड की जानकारी नहीं मिली।" });
    }

    const rows = table.find("tr").slice(1);
    const members = [];

    rows.each((i, row) => {
      const cols = $$(row).find("td");
      const name = $$(cols[1]).text().trim();
      const relation = $$(cols[2]).text().trim();
      const age = $$(cols[3]).text().trim();
      const gender = $$(cols[4]).text().trim();

      members.push({ name, relation, age, gender });
    });

    res.json({
      राशन_कार्ड_संख्या: number,
      सदस्य: members,
    });
  } catch (err) {
    console.error("Scraping error:", err.message);
    res.json({ error: "डाटा निकालने में दिक्कत आई" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
