const expressSession = require('express-session')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const path = require('path')
const PORT = 3000
const fs = require('fs').promises
const prisma = new PrismaClient()
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000 // ms
        },
        secret: 'a santa at nasa',
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            new PrismaClient(),
            {
                checkPeriod: 2 * 60 * 1000,  //ms
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined
            }
        )
    })
)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'form.html'))
})

app.post("/file", upload.single('file'), function (req, res, next) {
    console.log('hii', req.file, req.body)
    res.redirect("/")
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

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
})

app.get('/status', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    }
    else {
        res.send({ loggedIn: false })
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to log out')
        }

        res.send({ loggedIn: false })
    })
})

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
})

const printDirectories = async source => {
    console.log("print folders")
    const directories = (await fs.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

    console.log("directories: ", directories)
}

const makeDirectory = async (path) => {
    try {
        await fs.mkdir(path)
    } catch (error) {
        console.error(error)
    }
}

const renameDirectory = (prev, updated) => {
    fs.rename(prev, updated)
}

const deleteDirectory = (path) => {
    fs.rmdir(path)
}

const fsTest = async () => {
    await printDirectories("./uploads")
    console.log("create a folder")
    const path = './uploads/test_folder'
    makeDirectory(path)
    await printDirectories("./uploads")
    console.log('rename directory')
    const renamed = './uploads/test_folder_renamed'
    renameDirectory(path, renamed)
    await printDirectories("./uploads")
    console.log('delete directory')
    deleteDirectory(renamed)
    await printDirectories("./uploads")
}

// fsTest()
