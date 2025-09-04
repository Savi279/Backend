import { validationResult } from 'express-validator';

// @desc    Send a contact message
// @route   POST /api/contact
// @access  Public
export const sendContactMessage = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
        // For now, just log the message to the console
        console.log(`Contact form submission from ${name} (${email}): ${message}`);

        // In a real application, you would send an email or save to a database
        // Example using nodemailer (if configured):
        // await sendEmail({
        //     to: process.env.ADMIN_EMAIL,
        //     subject: `New contact message from ${name}`,
        //     text: message,
        // });

        res.status(200).json({ msg: 'Message sent successfully' });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).send('Server error');
    }
};
