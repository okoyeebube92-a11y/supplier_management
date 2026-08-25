require("dotenv").config();
const express = require('express');
const app = express();
const supplierRoutes = require("./routes/supplierRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

app.use(express.json());

app.use("/suppliers", supplierRoutes);
app.use("/orders", orderRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Supplier API is working" });
});

// These handlers must remain after every route so they only process unmatched requests and errors.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(5000, () => {
    console.log('Server running on port 5000!');
});

