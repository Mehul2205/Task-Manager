const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mehulpatni.2205@gmail.com',
        subject: 'Welcome to Task-Manager API',
        text: `Hi ${name}!
        Great to see you join the our Task Manager API. If you have any issues in this application Do let know about it.
        Thanks,
        Mehul Patni`
    })
}

const sendondeletionEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mehulpatni.2205@gmail.com',
        subject: 'Your Account Deleted Successfully!!',
        text: `Hi ${name}!
        Sorry to see you go!. If you want to leave a feedback about why you left do let us know.. Goodbye
        Thanks,
        Mehul Patni`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendondeletionEmail
}
