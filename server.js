const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const { number, district } = req.query;

  if (!number || !district) {
    return res.status(400).json({ error: "number और district दोनों पास करो" });
  }

  return res.json({
    number,
    district,
    data: "Scraping result yahan aayega"
  });
});

app.listen(port, () => {
  console.log('Server running on port ${port}');
});
