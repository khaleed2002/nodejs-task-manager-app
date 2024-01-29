import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
})



export const sendWelcomeEmail = (email, name) => {
    const mailOptions = {
        from: {
            name: 'Khaled Abdelrahman',
            address: process.env.GMAIL_USERNAME
        },
        to: [email],
        subject: 'Thanks for Joining in!',
        text: `Welcome to the app, ${name}. Let us know how you get along with the app.`
    }
    try {
        transporter.sendMail(mailOptions)
    } catch (error) {
        throw new Error(error)
    }
}

export const sendCancelEmail = (email, name) => {
    const mailOptions = {
        from: {
            name: 'Khaled Abdelrahman',
            address: process.env.GMAIL_USERNAME
        },
        to: [email],
        subject: 'Email Cancelation',
        text: `Hello ${name},

We hope you are well now and We want to know why did you cancel your email with us?`
    }

    transporter.sendMail(mailOptions)
}