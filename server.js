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
