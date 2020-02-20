const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendondeletionEmail} = require('../emails/account')
const User = require('../models/user')
const router = express.Router()
const auth = require('../middleware/auth')
const session = require('express-session')

router.get('/signup', async (req,res) =>{
    res.render('signup',{
        title:'Login Portal',
        name: 'Mehul Patni'
    })
})


router.post('/signup', async (req,res)=>{
    
    const user = new User({
        email: req.body.uemail,
        name: req.body.uname,
        age: req.body.uage,
        password: req.body.upassword
    })

    try{
        await user.save()
        //sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.setHeader('Authorization', 'Bearer '+ token); 
        console.log(req.header('Authorization'))
        res.header('Authorization', 'Bearer '+ token);
        console.log(req.header('Authorization'))
        res.redirect('/users/tasks')
        //res.status(201).send({user, token})
        
    }catch(e){
        res.status(500).send(e)
    }
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})


router.get('/login', async (req,res) =>{
    res.render('login',{
        title:'Login Portal',
        name: 'Mehul Patni'
    })
})


router.post('/login', async (req, res) =>{
    try{
        await res.setHeader('Content-Type', 'application/json');
        console.log(req.body)
        const user = await User.findByCredentials(req.body.uemail, req.body.upassword)
        console.log(user)
        const token = await user.generateAuthToken()
        console.log(token)
        req.session.token = token
        //res.header('Authorization', 'Bearer ' + token)
        // res.writeHeader('Authorization','bearer '+token)
        // res.setHeader('Authorization', 'bearer '+token)
        // res.set({
        //    Authorization: 'Bearer '+token
        //})
        res.redirect('/users/tasks')
        

        //  res.send({user, token})
    } catch(e){
        res.status(400).send(e)
    }
})


router.get('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.redirect('/login')
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.redirect('/login')
        
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user)
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // }catch{
    //     res.status(500).send()
    // }
    // User.find({}).then((users) =>{
    //     res.send(users)
    // }).catch((e) =>{
    //     res.status(500).send(e)
    // })
})

// router.get('/users/:id', async (req,res) => {

//     const _id = req.params.id

//     try{
//         const user = await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch{
//         res.status(500).send()
//     }

//     // User.findById(_id).then((user) =>{
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch((e) =>{
//     //     res.status(500).send(e)
//     // })
// })

router.patch('/users/me', auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const AllowedUpdates = ["name", "email", "password", "age"]
    const isValidOperation = updates.every((update) => AllowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Update!'})
    }

    const _id = req.user.id
    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        //    const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
} )

router.delete('/users/me', auth, async (req, res) => {

    const _id = req.user._id
    try{
        // const user = await User.findByIdAndDelete(_id)

        // if(!user){
        //     res.status(404).send()
        // }
        await req.user.remove()
        sendondeletionEmail(user.email, user.name)
        res.send(req.user)
    } catch(e){
        res.status(400).send(e)
    }
})

const upload = multer({
    limits:{
        fileSize: 1000000,       // 1Mb
    },
    fileFilter(req, file, cb){
        
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be an image'))
        }
        cb(undefined, true)
//        cb(undefined, false)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async(req, res) =>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error('Something went wrong')
        }
        res.set('Content-Type', 'images/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router