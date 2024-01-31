
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../../src/models/user.js'
import app from '../../src/app.js'
import Task from '../../src/models/task.js'

export const userTest1ID = new mongoose.Types.ObjectId()
export const userTest1 = {
    _id: userTest1ID,
    name: 'Khaled',
    email: 'khaled@gmail.com',
    password: 'khaled123',
    age: 22,
    tokens: [
        {
            token: jwt.sign({ _id: userTest1ID }, process.env.JWT_SECRET)
        }
    ]
}
export const userTest2ID = new mongoose.Types.ObjectId()
export const userTest2 = {
    _id: userTest2ID,
    name: 'Mustafa',
    email: 'mustafa@gmail.com',
    password: 'khaled123',
    age: 23,
    tokens: [
        {
            token: jwt.sign({ _id: userTest2ID }, process.env.JWT_SECRET)
        }
    ]
}

export const taskTest1 = {
    _id: new mongoose.Types.ObjectId(),
    description: '1st task for user 1',
    completed: true,
    creator: userTest1ID
}
export const taskTest2 = {
    _id: new mongoose.Types.ObjectId(),
    description: '2nd task for user 1',
    completed: false,
    creator: userTest1ID
}
export const taskTest3 = {
    _id: new mongoose.Types.ObjectId(),
    description: '1st task for user 2',
    completed: true,
    creator: userTest2ID
}


export const setupDB = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userTest1).save()
    await new User(userTest2).save()

    await new Task(taskTest1).save()
    await new Task(taskTest2).save()
    await new Task(taskTest3).save()
}

