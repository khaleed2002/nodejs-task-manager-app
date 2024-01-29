import { Router } from 'express'
import Task from '../models/task.js';
import auth from '../middleware/auth.js';
const router = new Router()

router.post('/tasks', auth, async (req, res) => {

    try {
        const task = new Task({ ...req.body, creator: req.user._id });
        await task.save()
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error)
    }
})

/* 
    GET /tasks?completed=true
    GET /tasks?limit=10&skip=10
    GET /tasks?sortBy=createdAt_asc | createdAt_desc
 */
// we can use all of these:
// GET /tasks?completed=false&limit=10&skip=10&sortBy=createdAt_desc

router.get('/tasks', auth, async (req, res) => {
    let match = {}
    if (req.query.completed) {
        if (req.query.completed === 'true') {
            match.completed = true
        } else if (req.query.completed === 'false') {
            match.completed = false
        }
    }

    let sort = {}
    if (req.query.sortBy) {
        try {
            const parts = req.query.sortBy.split('_')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        } catch (error) {
            return res.status(400).send()
        }
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }

})

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, creator: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send();
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdates = updates.every(update => allowedUpdates.includes(update))

    if (!isValidUpdates) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        // const taskUpdated = await Task.findByIdAndUpdate(
        //     req.params.id, req.body, { new: true, runValidators: true }
        // );
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, creator: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const taskDeleted = await Task.findByIdAndDelete(req.params.id);
        const taskDeleted = await Task.findOneAndDelete({ _id: req.params.id, creator: req.user._id })
        if (!taskDeleted) {
            return res.status(404).send()
        }
        res.send(taskDeleted)
    } catch (error) {
        res.status(500).send()
    }
})

export default router;