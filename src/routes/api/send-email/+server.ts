import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
    try {
        const { to, taskTitle } = await request.json();

        if (!to || !taskTitle) {
            return json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.SMTP_EMAIL,
                pass: env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: env.SMTP_EMAIL,
            to: to,
            subject: 'Task Completed: ' + taskTitle,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 600px;">
                    <h2 style="color: #4F46E5;">Task Completed! 🎉</h2>
                    <p>Great job! You have successfully completed the following task:</p>
                    <div style="background-color: #f9fdfa; padding: 15px; border-radius: 6px; border-left: 4px solid #10B981; margin: 15px 0;">
                        <h3 style="margin: 0; color: #1f2937;">${taskTitle}</h3>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">Keep up the great work!</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);

        return json({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        return json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }
}
