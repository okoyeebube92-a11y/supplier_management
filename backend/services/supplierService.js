const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
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


module.exports = {
    createSupplier,
    getAllSuppliers
};