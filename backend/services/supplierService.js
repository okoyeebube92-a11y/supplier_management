const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg(process.env.DATABASE_URL);

const prisma = new PrismaClient({
    adapter
});
const createSupplier = async (supplierData) => {
     
  return await prisma.supplier.create({
    data: supplierData
});
};

const getAllSuppliers = async () => {
    return await prisma.supplier.findMany();
};

const getSupplierById = async (id) => {
    return await prisma.supplier.findUnique({
        where: { id }
    });
};

const updateSupplier = async (id, supplierData) => {
    return await prisma.supplier.update({
        where: { id },
        data: supplierData
    });
};

const deleteSupplier = async (id) => {
    return await prisma.supplier.delete({
        where: { id }
    });
};

module.exports = {
    createSupplier,
    deleteSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier
};
