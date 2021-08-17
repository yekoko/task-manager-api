const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()


// Create new user with async and await
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }catch(e) {
        res.status(400).send(e)
    }
})

//login user
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }catch (e){
        res.status(400).send({ error: 'Invalid email or password'})
    }
})

//Logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( result => {
            return result.token !== req.token
        })
        await req.user.save()

        res.send()
    }catch (e) {
        res.status(500).send()
    }
})

//Logout all user
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Get all user with async and await
// router.get('/users', auth, async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     }catch(e) {
//         res.status(500).send()
//     }
// })

// Get user with async and await
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Get user by id with async and await
// router.get('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id)
//         if (!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e) {
//         res.status(500).send()
//     }
// })

// update user 
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every( update => allowedUpdates.includes(update))

    if(! isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!"})
    }
    try {
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        //const user = await User.findById(req.params.id)

        updates.forEach( update => req.user[update] = req.body[update])
        await req.user.save()

        // if(!user) {
        //     return res.status(404).send()
        // }

        res.send(req.user)
    }catch(e) {
        res.status(400).send(e)
    }
})

// Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()
        res.send(req.user)
    }catch(e) {
        res.status(500).send()
    }
})
const storage = multer.memoryStorage()
const upload = multer({
    dest: 'avatars',
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image!'))
        }

        cb(undefined, true)
    }
})

// Upload user profile pic
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


// Delete user profile pic
router.delete('/users/me/avatar', auth, async (req, res) => {
   req.user.avatar = undefined
   await req.user.save()
   res.send()

})


//Get user avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch (e) {
        res.status(404).send()
    }
})




// *** Create new user ***
// app.post('/users', (req, res) => {
//     const user = new User(req.body)

//     user.save().then( result => {
//         res.send(result)
//     }).catch( error => {
//         res.status(400).send(error)
//     })
// })

// Get all user
// app.get('/users', (req, res) => {
//     User.find({}).then(result => {
//         res.send(result)
//     }).catch(error => {
//         res.status(500).send()
//     })
// })

// Get user by id
// app.get('/users/:id', (req, res) => {
//     User.findById(req.params.id).then( result => {
//         if (!result)
//         {
//             return res.status(404).send()
//         }
//         res.send(result)
//     }).catch( error => {
//         res.status(500).send()
//     })
// })

// Create new task
// app.post('/tasks', (req, res) => {
//     const task = new Task(req.body)

//     task.save().then( result => {
//        res.send(result)
//     }).catch( error => {
//         res.status(400).send(error)
//     })
// })

module.exports = router