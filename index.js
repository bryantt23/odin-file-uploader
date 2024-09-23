const expressSession = require('express-session')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const path = require('path')
const PORT = 3000

const app = express()

// app.use(
//     expressSession({
//         cookie: {
//             maxAge: 7 * 24 * 60 * 60 * 1000 // ms
//         },
//         secret: 'a santa at nasa',
//         resave: true,
//         saveUninitialized: true,
//         store: new PrismaSessionStore(
//             new PrismaClient(),
//             {
//                 checkPeriod: 2 * 60 * 1000,  //ms
//                 dbRecordIdIsSessionId: true,
//                 dbRecordIdFunction: undefined
//             }
//         )
//     })
// )

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'form.html'))
})

app.post("/file", upload.single('file'), function (req, res, next) {
    console.log('hii', req.file, req.body)
    res.redirect("/")
})

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
})