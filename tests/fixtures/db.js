const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
    _id: testUserId,
    name: 'kokoye',
    email: 'kokoye@gmail.com',
    password: '@!123321',
    tokens: [
        {
            token: jwt.sign({ _id: testUserId}, process.env.JWT_SECRET)
        }
    ]
}

const testUserTwoId = new mongoose.Types.ObjectId()
const testUserTwo = {
    _id: testUserTwoId,
    name: 'James',
    email: 'jame@gmail.com',
    password: '@!123321213',
    tokens: [
        {
            token: jwt.sign({ _id: testUserTwoId}, process.env.JWT_SECRET)
        }
    ]
}
const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "My First Task",
    completed: false,
    owner: testUser._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "My Second Task",
    completed: true,
    owner: testUser._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "My Third Task",
    completed: false,
    owner: testUserTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(testUser).save()
    await new User(testUserTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    testUserId,
    testUser,
    testUserTwoId,
    testUserTwo,
    taskOne,
    setupDatabase
}