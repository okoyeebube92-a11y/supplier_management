const {
    createOrder,
    getOrderDetail,
    getSupplierOrders
} = require("../services/orderService");
const { validateSupplierId } = require("../validation/supplierValidation");
const { validateOrderBody, validateOrderId } = require("../validation/orderValidation");

const createOrderController = async (req, res, next) => {
    const idValidation = validateSupplierId(req.params.supplierId);
    if (idValidation.error) {
        return res.status(400).json({ error: idValidation.error });
    }

    const bodyValidation = validateOrderBody(req.body);
    if (bodyValidation.errors) {
        return res.status(400).json({ error: "Invalid order data.", details: bodyValidation.errors });
    }

    try {
        const order = await createOrder(idValidation.value, bodyValidation.value);
        const detail = await getOrderDetail(order.id);
        return res.status(201).json(detail);
    } catch (error) {
        return next(error);
    }
};

const getSupplierOrdersController = async (req, res, next) => {
    const validation = validateSupplierId(req.params.supplierId);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const orders = await getSupplierOrders(validation.value);
        return res.status(200).json(orders);
    } catch (error) {
        return next(error);
    }
};

const getOrderDetailController = async (req, res, next) => {
    const validation = validateOrderId(req.params.orderId);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const order = await getOrderDetail(validation.value);
        return res.status(200).json(order);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createOrderController,
    getOrderDetailController,
    getSupplierOrdersController
};
