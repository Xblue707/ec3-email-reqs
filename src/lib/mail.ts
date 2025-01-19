import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
	host: 'smtp.purelymail.com',
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER || import.meta.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS || import.meta.env.EMAIL_PASS,
	},
});
