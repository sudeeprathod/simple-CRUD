const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const port = 5000;
const multer = require('multer')
const upload = multer({
    dest: 'uploads/'
})
const fs = require('fs');
const stream = require('stream')
const path = require('path');

const BookModal = require('./book.modal');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

var dbPath = "mongodb://localhost/booksDb";
mongoose.connect(dbPath);
mongoose.connection.once('open', function () {
    console.log("Connected to Database  Successfully.");
});


app.get('/get', (req, res) => {
    //res.send('working')
    BookModal.find({}, (err, data) => {
        if (err) {
            return res.status(500)
        }
        return res.send({
            status: 200,
            data: data
        });
    });
});

app.get('/getImageById/:id', (req, res) => {
    const id = req.params.id;
    BookModal.findById(id, (err, data) => {
        if (err) {
            return res.status(500)
        }
        var filePath = path.join(__dirname, data.bookCoverPath);
        const r = fs.createReadStream(filePath)
        const ps = new stream.PassThrough()
        stream.pipeline(
            r,
            ps,
            (err) => {
                if (err) {
                    console.log(err)
                    return res.sendStatus(400);
                }
            })
        ps.pipe(res)
    });
});

app.get('/getById/:id', (req, res) => {
    const id = req.params.id;
    BookModal.findById(id, (err, data) => {
        if (err) {
            return res.status(500)
        }
        return res.send({
            status: 200,
            data: data
        });
    });
});

app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    BookModal.findByIdAndDelete(id, (err, data) => {
        const filePath = path.join(__dirname, data.bookCoverPath);
        if (!err) {
            fs.unlinkSync(filePath)
            res.send({
                status: 200,
                msg: 'Deleted success'
            })
        }
    })
})
app.put('/update/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;

    const obj = {
        title: req.body.title,
        author: req.body.author,
        bookCoverPath: req.file.path
    }
    console.log(obj)
    BookModal.findByIdAndUpdate(id, obj, (err) => {
        if (err) {
            return res.status(500)
        }
        return res.send({
            status: 'successfully updated'
        });
    });
});
app.post('/post', upload.single('image'), (req, res) => {
    const obj = {
        title: req.body.title,
        author: req.body.author,
        bookCoverPath: req.file.path
    }
    var book = new BookModal(obj)
    book.save(obj, (err) => {
        if (err) {
            return res.status(500)
        }
        return res.send({
            status: 'success'
        });
    });
});

app.listen(port, () => {
    console.log('listening on port', port);
})