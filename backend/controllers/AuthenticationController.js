const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const login = async (req, res) => {
    const { username, password } = req.body
    console.log("🚀 ~ login ~ username, password:", username, password)

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (user && user.password === password) {
        req.session.user = { id: user.id, username: user.username }
        res.send({ loggedIn: true })
    }
    else {
        res.status(401).send({ loggedIn: false })
    }
}

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to log out')
        }

        res.send({ loggedIn: false })
    })
}

const getStatus = (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    }
    else {
        res.send({ loggedIn: false })
    }
}

module.exports = { login, logout, getStatus }