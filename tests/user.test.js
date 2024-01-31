import app from '../src/app.js'
import request from 'supertest'
import User from '../src/models/user.js'
import { userTest1ID, userTest1, setupDB } from "./fixtures/db";

beforeEach(setupDB)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        email: "  ahmed.hamdy@gmail.com",
        password: "khaledkhaled",
        name: " ahmed hamdy  ",
        age: 23
    }).expect(201)

    // Assert that database was changed successfully
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertion about user password
    expect(user.password).not.toBe(userTest1.password)
})

test('Should not signup user with invalid name', async () => {
    await request(app)
        .post('/users')
        .send({
            email: "  ahmed.hamdy@gmail.com",
            password: "khaledkhaled",
            name: undefined,
            age: 23
        })
        .expect(400)
})

test('Should not signup user with invalid email', async () => {
    await request(app)
        .post('/users')
        .send({
            email: "  ahmed.hamdy.com",
            password: "khaledkhaled",
            name: " ahmed hamdy  ",
            age: 23
        })
        .expect(400)
})

test('Should not signup user with invalid password', async () => {
    await request(app)
        .post('/users')
        .send({
            email: "  ahmed.hamdy@gmail.com",
            password: "password",
            name: " ahmed hamdy  ",
            age: 23
        })
        .expect(400)
})

test('Should signin an existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userTest1.email,
        password: userTest1.password
    }).expect(200)

    // fetch user from database
    const userDB = await User.findById(userTest1ID)

    // Assert that token in response matches users second token
    expect(response.body.token).toBe(userDB.tokens[1].token)
})

test('Should not login, existing user with wrong password', async () => {
    await request(app).post('/users/login').send({
        email: userTest1.email,
        password: 'wrongpassword123'
    }).expect(400)
})

test('Should not login, nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'nonexist123@gmail.com',
        password: 'nonexist123'
    }).expect(400)
})

test('Should get profile for a user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send()
        .expect(200)

    // Validate user is remover
    const user = await User.findById(userTest1ID)
    expect(user).toBeNull()

})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/me_new_formal.jpeg')
        .expect(200)

    // Asset that avatar is saved in database
    const user = await User.findById(userTest1ID)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            name: 'New Name'
        })

    // confirm name has been changed in the database
    const user = await User.findById(userTest1ID)
    expect(user.name).toBe('New Name')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            location: 'Giza'
        }).expect(400)
})

test('Should not update user with invalid name', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            name: ''
        })
        .expect(400)
})

test('Should not update user with invalid email', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            email: 'as.ssww.c'
        })
        .expect(400)
})

test('Should not update user with invalid password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userTest1.tokens[0].token}`)
        .send({
            password: 'password'
        })
        .expect(400)
})

