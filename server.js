const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const { number, district } = req.query;

  if (!number || !district) {
    return res.status(400).json({ error: "कृपया number और district दोनों भेजें" });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("ddl_dist_name", district);
    formData.append("txt_rc_no", number);
    formData.append("btn_submit", "Submit");

    const response = await axios.post(
      "https://nfsa.gov.in/public/frmPublicGetMyRCDetails.aspx",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const $ = cheerio.load(response.data);

    const cardholderName = $("#ctl00_ContentPlaceHolder1_gvDetails_lbl_Name_0").text().trim();
    const memberNames = [];

    $("#ctl00_ContentPlaceHolder1_gvFamilyDetails td:nth-child(2)").each((i, el) => {
      memberNames.push($(el).text().trim());
    });

    if (!cardholderName || memberNames.length === 0) {
      return res.json({ error: "डाटा निकालने में दिक्कत आई" });
    }

    res.json({
      rationCardNumber: number,
      district,
      name: cardholderName,
      members: memberNames
    });
  } catch (err) {
    console.error("Error while scraping:", err.message);
    res.status(500).json({ error: "सर्वर में कोई दिक्कत आ गई" });
  }
});

app.listen(port, () => {
  console.log(`Server
