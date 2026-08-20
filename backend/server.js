require("dotenv").config();
const express = require('express');
const app = express();
const supplierRoutes = require("./routes/supplierRoutes");

app.use(express.json());

app.use("/suppliers", supplierRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Supplier API is working" });
});

app.listen(5000, () => {
    console.log('Server running on port 5000!');
});

