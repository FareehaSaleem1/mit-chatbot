// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const fs = require('fs'); // Built-in tool to read files
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const app = express();
// const port = 3000;

// app.use(cors());
// app.use(express.json());

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Use the model name that worked for you in the previous step
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

// // 1. Load Company Data
// // We read the JSON file once when the server starts
// const companyData = JSON.parse(fs.readFileSync('company-data.json', 'utf8'));

// app.post('/chat', async (req, res) => {
//     try {
//         const userMessage = req.body.message;

//         // 2. Create a "Context" String
//         // We turn the JSON data into a text summary for the AI
//         const servicesText = companyData.services.map(s => 
//             `- ${s.name}: ${s.price} (${s.details})`
//         ).join('\n');

//         const faqsText = companyData.faqs.map(f => 
//             `Q: ${f.question}\nA: ${f.answer}`
//         ).join('\n');

//         // 3. The "Employee" Prompt
//         // We inject the data directly into the instructions
//         const prompt = `
//             You are a senior customer success manager at "${companyData.company_name}".
//             Your tone is professional, warm, and helpful. You are based in ${companyData.location}.
            
//             HERE IS YOUR COMPANY KNOWLEDGE BASE:
//             -------------------------------------
//             CONTACT EMAIL: ${companyData.contact_email}
            
//             OUR SERVICES & PRICING:
//             ${servicesText}
            
//             COMMON POLICIES (FAQs):
//             ${faqsText}
//             -------------------------------------

//             INSTRUCTIONS:
//             1. Only answer based on the knowledge base above.
//             2. If the user asks for a custom quote not listed, ask for their email so a human can contact them.
//             3. Keep answers short (under 3 sentences) unless the user asks for details.
//             4. If asked about prices, be confident but mention "starts from".

//             USER MESSAGE: "${userMessage}"
//         `;

//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();

//         res.json({ reply: text });

//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.listen(port, () => {
//     console.log(`Mit Digital Bot running at http://localhost:${port}`);
// });


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); // New import
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
// IMPORTANT: Render sets the PORT variable automatically.
// We tell it: "Use Render's port, or 3000 if running on my laptop."
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Serve the Frontend (HTML)
// This makes your index.html accessible via the URL
app.use(express.static(path.join(__dirname, 'public')));

// 2. Load Company Data
// Since it's a JSON file, we just read it.
const companyData = JSON.parse(fs.readFileSync('company-data.json', 'utf8'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"}); 

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        

// Prepare Context
const servicesText = companyData.digital_services.map(s => `- ${s.name}: ${s.details}`).join('\n');
const coursesText = companyData.educational_courses.map(c => 
    `${c.category}: ${c.list.join(', ')}`
).join('\n');
const faqsText = companyData.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n');

const prompt = `
    You are the official AI Assistant for "MIT Digital" and "Multan Institute of Information Technology".
    
    YOUR KNOWLEDGE BASE:
    --------------------
    CONTACT: Phone: ${companyData.contact.phone} | Email: ${companyData.contact.email}
    LOCATION: ${companyData.location}
    
    DIGITAL SERVICES WE OFFER:
    ${servicesText}
    
    COURSES WE TEACH:
    ${coursesText}
    
    FAQs:
    ${faqsText}
    --------------------

    STRICT INSTRUCTIONS:
    1. Keep your answers SHORT (maximum 2 sentences).
    2. If the user asks for a price/quote, say: "Please share your email so our team can send you a custom quote."
    3. If the user asks something NOT in the knowledge base, say: "I don't have that info right now. Could you leave your email so a human agent can help you?"
    4. Be professional but friendly.

    USER QUESTION: "${userMessage}"
`;



        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});