import express from 'express';
import mongoose from './db/mongoose.js';
// import routers
import userRouter from './routers/user.js'
import taskRouter from './routers/task.js'


const app = express();
const port = process.env.PORT || 3000

// Middleware to parse JSON data
app.use(express.json());
// Error handling middleware for JSON parsing errors
// app.use((err, req, res, next) => {
//     if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//         return res.status(400).json({ error: 'Invalid JSON format' });
//     }
//     next();
// });

// middleware for maintainance mode

// app.use((_req, res, next) => {
//     res.status(503).send('Sorry server is down now because of maintainance')
// })

app.use(taskRouter)
app.use(userRouter)

app.get('*', (req, res) => {
    res.status(404).send({ error: 'Error 404, Not found' })
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})
