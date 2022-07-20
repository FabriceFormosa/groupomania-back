
// npm run db:generate a effectuer pour instancier un  client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = {prisma}