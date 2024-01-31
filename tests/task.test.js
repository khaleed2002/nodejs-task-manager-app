import Task from "../src/models/task";
import request from 'supertest'
import { userTest1ID, userTest1, setupDB, taskTest1, userTest2, taskTest3 } from "./fixtures/db";
import app from '../src/app.js'

beforeEach(setupDB)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            description: 'Finish section 16 (Testing Node.js)'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Should not create task with invalid description', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            description: undefined,
            completed: true
        })
        .expect(400)
})

test('Should not create task with invalid completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            description: 'finish section 16 (testing)',
            completed: 'new task'
        })
        .expect(400)
})

test('Should fetch user task by id', async () => {
    await request(app)
        .get(`/tasks/${taskTest1._id}`)
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${taskTest1._id}`)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${taskTest3._id}`)
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Get all tasks for user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)
    // console.log(response);
    expect(response.body.length).toBe(2)

})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].completed).toBe(true)
})

test('Should sort tasks by description', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=description_desc')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toBe('2nd task for user 1')
    expect(response.body[1].description).toBe('1st task for user 1')
})
test('Should sort tasks by completed', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=completed_asc')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].completed).toBe(false)
    expect(response.body[1].completed).toBe(true)
})
test('Should sort tasks by createdAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=createdAt_asc')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new Date(response.body[0].createdAt).getTime())
        .toBeLessThanOrEqual(new Date(response.body[0].createdAt).getTime())
})
test('Should sort tasks by updatedAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt_asc')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new Date(response.body[0].updatedAt).getTime())
        .toBeLessThanOrEqual(new Date(response.body[0].updatedAt).getTime())
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get('/tasks?limit=1&skip=1')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].description).toBe('2nd task for user 1')
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].completed).toBe(false)
})

test('Should delete task for user', async () => {
    await request(app)
        .delete(`/tasks/${taskTest1._id}`)
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)

    // Assert that task has been deleted in database
    const task = await Task.findOne({ _id: taskTest1._id, creator: userTest1ID })
    expect(task).toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskTest1._id}`)
        .send()
        .expect(401)
})

test('Should not delete task (user2 should not delete task that user1 created)', async () => {
    await request(app)
        .delete(`/tasks/${taskTest1._id}`)
        .set('Authorization', `Bearer ${userTest2.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findOne({ _id: taskTest1._id, creator: userTest1._id })
    expect(task).not.toBeNull()

})


test('Should not update task with invalid description', async () => {
    await request(app)
        .patch(`/tasks/${taskTest1}`)
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            description: ""
        })
        .expect(400)
})
test('Should not update task with invalid completed', async () => {
    await request(app)
        .patch(`/tasks/${taskTest1}`)
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            completed: "new task"
        })
        .expect(400)
})

test('Should not update other users task', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskTest1._id}`)
        .set('Authorization', `Bearer ${userTest2.tokens[0].token}`)
        .send({
            completed: false
        })
        .expect(404)
    // console.log(response.body);
})