import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contactDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema and Model
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Helper function for validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/; // Only 10 digits
    return phoneRegex.test(number);
};

// API Endpoint
app.post('/api/customer-data', async (req, res) => {
    try {
        const { name, number, email, city } = req.body;

        // Validation
        if (!name || !number || !email || !city) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (!isValidPhoneNumber(number)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number. Please provide a 10-digit number.' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        // Save to MongoDB
        const contact = new Contact({ name, number, email, city });
        await contact.save();

        res.status(200).json({ success: true, message: 'Contact saved successfully!' });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ success: false, message: 'An error occurred while saving the contact data.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
