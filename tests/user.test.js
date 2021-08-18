const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { testUserId, testUser, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Yekoko',
        email: 'yekoko@gmail.com',
        password: '@!123321'
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Yekoko',
            email: 'yekoko@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('@!123321')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: testUser.email,
        password: testUser.password
    }).expect(200)

    const user = await User.findById(testUserId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: testUser.email,
        password: 'rearewrawer'
    }).expect(400)
})

test('Should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile if not authenticate user', async () => {
    await request(app).get('/users/me').send().expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user = await User.findById(testUserId)
    expect(user).toBeNull()
})

test('Should not delete if not authenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar iamge', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(testUserId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send({ name: 'koko' })
        .expect(200)
    
    const user = await User.findById(testUserId)
    expect(user.name).toEqual('koko')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send({ location: 'Myanmar' })
        .expect(400)
})
//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated