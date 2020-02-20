const path = require('path')
const express = require('express')
const hbs = require('hbs')
const session = require('express-session')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT


// Define paths for Express config
const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname,'../templates/views')
const partialsPath = path.join(__dirname,'../templates/partials')

// Setup handlebars engine and views location
app.set('view engine','hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.urlencoded({ extended: false }));

// app.use((req,res, next) => {
//     //  console.log(req.method, req.path)
//     if(req.method === 'GET'){
//         res.send('GET requests are disabled')
//     } else{
//         next()
//     }
// })

//  This is a middleware function in case of site under maintenance
// app.use((req,res, next) => {
//      res.status(503).send('The site is under maintenance. Come back soon')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.get('', (req, res)=> {
    res.render('index2',{
        title:'Your Task Management Web-Application',
        name: 'Mehul Patni'
    })
})

const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits:{
        fileSize: 1000000,       // 1Mb
    },
    fileFilter(req, file, cb){
        
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('File must be a PDF'))
        }
        cb(undefined, true)
//        cb(undefined, false)

    }
})

app.post('/upload', upload.single('upload'), (req,res) =>{
    res.send()
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})

// const router = new express.Router()
// router.get('/test', (req, res) =>{
//     res.send("This is from another router")
// })
// app.use(router)

app.listen(port, () => {
    console.log('Server is up on port '+port)
})


const Task = require('./models/task')
const User = require('./models/user')

const main = async () => {
    // const task = await Task.findById('5e1af3a8761c131c607c8a55')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)

    const user = await User.findById('5e1af39b761c131c607c8a53')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}
//main()

