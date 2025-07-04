# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ca175b5d-c3db-4c59-8af4-8f303b5e0dc2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ca175b5d-c3db-4c59-8af4-8f303b5e0dc2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ca175b5d-c3db-4c59-8af4-8f303b5e0dc2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Hostel Hub Secure Enroll

## Project Structure

```
hostel-hub-secure-enroll/
  backend/                # Node.js/Express/MongoDB API
    models/
    routes/
    controllers/
    middleware/
    utils/
    .env                  # Environment variables (see .env.example)
    server.js             # Entry point
  src/                    # React frontend (user/admin panels)
    components/
    pages/
    hooks/
    ...
```

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in the required values (see below).
4. `npm run dev` to start the backend server.

### Frontend
1. `cd ..` (project root)
2. `npm install`
3. `npm run dev` to start the frontend (Vite/React).

### .env.example (Backend)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
RECEIPT_EMAIL=your_receipt_account_email
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

- The admin email/password and receipt account email will be hardcoded via env.
- All user/admin features run on the same server.
- See code for further details on endpoints and usage.
