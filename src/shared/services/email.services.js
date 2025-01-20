/**
 * @Service 
 */

module.exports = class EmailService {
    constructor() {}



    /**
     * @sendEmail 
     */

    static sendEmail = async(email, locals, template) => {

        return new Promise(async(resolve, reject) => {
            try {

                const path = require('path')

                const nodemailer = require('nodemailer')
                const Email = require('email-templates')

                const emailObj = new Email({
                    message: {
                        from: { name: process.env.SMTP_FROM_NAME || process.env.APP_NAME, address: process.env.SMTP_FROM_ADDRESS },
                    },
                    // uncomment below to send emails in development/test env:
                    send: true,
                    transport: nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT,
                        auth: {
                            user: process.env.SMTP_USERNAME,
                            pass: process.env.SMTP_PASSWORD,
                        },
                    }),
                    views: {
                        root: path.resolve(path.dirname(__dirname), 'snippets/email_markup/templates/'),
                        options: {
                            extension: 'njk',
                        },
                    },
                    preview: false,
                })

                const mail = await emailObj.send({
                    template,
                    message: {
                        to: email,
                    },
                    locals: {
                        ...locals,
                    },
                })


                resolve({
                    success: true,
                    data: mail,
                })

            } catch (error) {
                console.log("error", error)
                reject(error);

            }
        })

    };



}