import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import process from 'process'
import Task from "./task.js";

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('You should provide a valid email.')
            }
        },
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.length <= 6) {
                throw new Error("Password length should be greater than 6.")
            }
            if (validator.contains(value.toLowerCase(), 'password')) {
                throw new Error("Password field should not contain 'password'. ")
            }
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age should be greater than zero.")
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
},
    {
        timestamps: true
    })
// to get tasks for each user (for mongoose only)
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'creator'
})
// create a function for instance of User model
// to hide unneccessary data when send back user
userSchema.methods.toJSON = function () {
    let user = this.toObject(); // we should convert it to object first
    delete user.password;
    delete user.tokens;
    delete user.avatar
    return user
}
// to authenticate user to be used by 'user.generateAuthToken()'
userSchema.methods.generateAuthToken = async function () {
    let user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" })
    user.tokens.push({ token });
    await user.save();

    return token;
}


// create a function to login user to be used by 'User.findByCredentials(...)'
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

// middleware to hash password
userSchema.pre('save', async function (next) {
    let user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})

// delete user tasks when user removed/deleted
userSchema.pre('deleteOne', async function (next) {
    try {
        let user = this._conditions;
        await Task.deleteMany({ creator: user._id })
        next()
    } catch (error) {
        res.status(400).send()
    }

})


const User = model('User', userSchema)

export default User;