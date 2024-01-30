import express from 'express';
import mongoose from './db/mongoose.js';
import userRouter from './routers/user.js'
import taskRouter from './routers/task.js'

const app = express();

// Middleware to parse JSON data
app.use(express.json());

app.use(taskRouter)
app.use(userRouter)

app.get('*', (req, res) => {
    res.status(404).send({ error: 'Error 404, Not found' })
})


export default app