const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {check, validationResult } = require ('express-validator');


const MongoClient = require('mongodb').MongoClient;

const uri ="mongodb+srv://gus:g8t6t5g2@cluster0-8f0jm.mongodb.net/crud-nodejs?retryWrites=true&w=majority";

MongoClient.connect(uri, (err, client)=> {
    if(err) return console.log(err)
    db = client.db('crud-nodejs')

    app.listen(3000, () => {
        console.log('Sever running on port 3000')
    })
    
})

app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extendend: true}))

app.use(express.json());
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    db.collection('data').find().toArray((err, results) => {
        if (err) return console.log(err)
        res.render('index.ejs', { data: results })
        
    })
});



app.post('/', [
    check('name').isAscii(),
    check('surname').isAscii(),
    check('comissao').isNumeric()], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array() });
    }
    var id = req.params.id
    var name = req.body.name
    var surname = req.body.surname
    var rotule = name + ' ' + surname
    var comissao = parseInt(req.body.comissao);

    if(comissao > 100){
        err="Wrong participation value";
        return res.send(err);
    }

    db.collection('data').insert({id, name, surname, rotule, comissao}, (err, result) => {
        
        if (err) return console.log(err)
         
        console.log('Salvo no Banco de Dados')
        res.redirect('/')
    })
});

app.route('/edit/:id')
.get((req, res)=>{
    var id = req.params.id
    var ObjectId = require('mongodb').ObjectID;

    db.collection('data').find(ObjectId(id)).toArray((err, result)=>{
        if(err) return res.send(err)
        res.render('edit.ejs', {data: result }) 
    })
})

.post((req, res)=> {
    var id = req.params.id
    var name = req.body.name
    var surname = req.body.surname
    var rotule = name + ' ' + surname
    var comissao = parseInt(req.body.comissao)
    var ObjectId = require('mongodb').ObjectID;
    
   
    db.collection('data').updateOne({_id: ObjectId(id)}, {
        $set: {
            name: name,
            surname: surname,
            rotule: rotule,
            comissao: comissao
            
        }
        
    }, (err, result) => {
        if(err) return res.send(err)
        res.redirect('/')
        console.log('Atualizado no Banco de Dados')
    })
})

app.route('/delete/:id')
.get((req, res)=> {
    var id = req.params.id
    var ObjectId = require('mongodb').ObjectID;

    db.collection('data').deleteOne({_id: ObjectId(id)}, (err, result) => {
        if(err) return res.send(500, err)
        console.log('Deleteado do Banco de Dados!')
        res.redirect('/')
    })
})



