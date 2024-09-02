const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import cors
const bodyParser = require('body-parser'); // Import body-parser

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

// Use bodyParser to parse JSON body
app.use(bodyParser.json());

// Route to convert LaTeX code to .docx
app.post('/convert', (req, res) => {
    const latexCode = req.body.latexCode;

    if (!latexCode) {
        return res.status(400).send('No LaTeX code provided.');
    }

    // Define paths for temporary files
    const tempTexPath = path.join(__dirname, 'uploads', 'temp.tex');
    const tempDocxPath = path.join(__dirname, 'uploads', 'temp.docx');

    // Write LaTeX code to a temporary file
    fs.writeFile(tempTexPath, latexCode, (err) => {
        if (err) {
            console.error(`Error writing LaTeX file: ${err}`);
            return res.status(500).send('Error writing LaTeX file.');
        }

        // Run pandoc command to convert LaTeX to DOCX
        const command = `pandoc -s ${tempTexPath} -o ${tempDocxPath}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).send('Conversion failed.');
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).send('Conversion failed.');
            }

            // Send the converted file back to the client
            res.download(tempDocxPath, (err) => {
                if (err) {
                    console.error(`Error sending file: ${err}`);
                }

                // Clean up temporary files after sending
                fs.unlink(tempTexPath, () => {});
                fs.unlink(tempDocxPath, () => {});
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});