const express = require('express')
const { get } = require('http')
const app = express()
const { MongoClient,ObjectId } = require('mongodb')

const DATABASE_URL = 'mongodb+srv://ducky:123456a@cluster0.plsan.mongodb.net/test'
const DATABASE_Name = 'HoangPhuTaiDB'



app.set('view engine', 'hbs')
app.use(express.urlencoded({extended: true}))

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/insert',(req,res)=>{
    res.render('product')
})

app.post('/edit',async(req,res)=>{
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    const id = req.body.txtId
    const myquery = { _id: ObjectId(id)}
    const newvalues = { $set: {name:nameInput, price: priceInput, picURL: picURLInput}}
    const dbo = await getDatabase()
    await dbo.collection("Product").updateOne(myquery,newvalues)
    res.redirect('/view')
})

app.get('/edit', async(req,res)=>{
    const id = req.query.id
    //truy cap database lay product co id o tren
    const dbo = await getDatabase()
    const productToEdit = await dbo.collection("Product").findOne({_id:ObjectId(id)})
    res.render('edit',{product:productToEdit})
})

app.get('/delete',async(req,res)=>{
    const id = req.query.id
    console.log("delete id:"+id)
    const dbo = await getDatabase()
    await dbo.collection("Product").deleteOne({_id:ObjectId(id)})
    res.redirect('/view')
})

app.get('/view',async(req,res)=>{
    //bring up data from mongo
    const dbo = await getDatabase()
    const results = await dbo.collection("Product").find({}).sort({price:-1}).limit(6).toArray()
    //show on view.hbs
    res.render('view',{products:results})
})
app.post('/product',async(req,res)=>{
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    //check price
    if(isNaN(priceInput)==true){
        // not number=>>break
        const errorMessage = "Please input number"
        const oldValues = {name:nameInput,price:priceInput,picURL:picURLInput}
        res.render('product',{error:errorMessage,oldValues:oldValues})
        return;
    }
    const newP = {name:nameInput,price:Number.parseFloat(priceInput),picURL:picURLInput}

    const dbo = await getDatabase()
    const result = await dbo.collection("Product").insertOne(newP)
    console.log("Gia tri", result.insertedId.toHexString());
    res.redirect('/')
})

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("SV is running!")

async function getDatabase() {
    const client = await MongoClient.connect(DATABASE_URL)
    const dbo = client.db(DATABASE_Name)
    return dbo
}
