# Voice Notes App Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in this directory with the following content:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
   - For Gmail, you may need to create an App Password: https://support.google.com/accounts/answer/185833

3. Start the server:
   ```bash
   node index.js
   ```

## Endpoints
- `POST /send-email` — Send a note to your email.
- `POST /ocr` — Upload images for OCR (multipart/form-data, field: `images`). 