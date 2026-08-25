const { createPayment, getOrderPayments } = require("../services/paymentService");
const {
    validatePaymentBody,
    validatePaymentOrderId
} = require("../validation/paymentValidation");

const createPaymentController = async (req, res, next) => {
    const idValidation = validatePaymentOrderId(req.params.orderId);
    if (idValidation.error) {
        return res.status(400).json({ error: idValidation.error });
    }

    const bodyValidation = validatePaymentBody(req.body);
    if (bodyValidation.errors) {
        return res.status(400).json({
            error: "Invalid payment data.",
            details: bodyValidation.errors
        });
    }

    try {
        const result = await createPayment(idValidation.value, bodyValidation.value);
        return res.status(201).json(result);
    } catch (error) {
        return next(error);
    }
};

const getOrderPaymentsController = async (req, res, next) => {
    const validation = validatePaymentOrderId(req.params.orderId);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const result = await getOrderPayments(validation.value);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createPaymentController,
    getOrderPaymentsController
};
