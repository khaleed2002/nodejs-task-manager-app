import User from '../models/user.js';
import { Router } from 'express';
import auth from '../middleware/auth.js';
import multer from 'multer'
import sharp from 'sharp'
import { sendWelcomeEmail, sendCancelEmail } from '../emails/account.js'

const router = new Router()

router.post('/users', async (req, res) => {

    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send({ error: "Unable to login" })
    }

})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)

        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save();

        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {

    try {
        const id = req.user.id
        const updates = Object.keys(req.body)
        const allowedUpdates = ['password', 'email', 'name', 'age']
        const isValidUpdates = updates.every(update => allowedUpdates.includes(update));

        if (!isValidUpdates) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
        // const user_updated = await User.findByIdAndUpdate(_id, req.body, { runValidators: true, new: true })
        // another way to make middleware works fine
        // let user = await User.findById(id)

        let user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const userDeleted = await User.findByIdAndDelete(req.user._id)
        // if (!userDeleted) {
        //     return res.status(404).send()
        // }
        await User.deleteOne({ _id: req.user._id })
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image with one of these extentions(jpg, jpeg, png)'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const pngBufferImg = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = pngBufferImg
        await req.user.save()
        res.send()
    } catch (error) {
        res.send(error?.message)
    }

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {

        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }

})


export default router;