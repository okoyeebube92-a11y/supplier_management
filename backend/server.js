require("dotenv").config();
const express = require('express');
const cors = require("cors");
const app = express();
const supplierRoutes = require("./routes/supplierRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

// Allow only the standard local Vite origins used to develop this separate frontend.
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
}));
app.use(express.json());

app.use("/suppliers", supplierRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Supplier API is working" });
});

// These handlers must remain after every route so they only process unmatched requests and errors.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(5000, () => {
    console.log('Server running on port 5000!');
});

