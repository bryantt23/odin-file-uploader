const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createUser() {
    const user = await prisma.user.create({
        data: {
            username: 'x',
            password: 'x'
        }
    });
    console.log('Created new user:', user);
}

createUser()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect()
    })