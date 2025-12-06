# YouTube Rewind

This is a Next.js application that analyzes your YouTube watch history from a Google Takeout export and presents you with a "wrapped" style summary of your habits.

## Getting Started Locally

To run this project on your local machine, you'll need to have [Node.js](https://nodejs.org/) (version 18 or higher is recommended) and a package manager like `npm` installed.

### 1. Install Dependencies

Open a terminal in the project's root directory and run the following command to install all the necessary packages:

```bash
npm install
```

### 2. Run the Development Server

Once the dependencies are installed, start the local development server:

```bash
npm run dev
```

This will start the application, typically on `http://localhost:9002`. You can open this URL in your browser to see the app running.

### 3. Use the Application

1.  **Get Your Google Takeout Data:**
    *   Go to <a href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">Google Takeout</a>.
    *   Click "Deselect all".
    *   Select "YouTube and YouTube Music".
    *   Click "All YouTube data included" and then "Deselect all".
    *   Select only **history** and **subscriptions**.
    *   For the **history** data, click the button that says "HTML" and change the format to **JSON**.
    *   Complete the export process and download the `.zip` file.
    *   Unzip the downloaded file. You will now have a `Takeout` folder.

2.  **Upload to the App:**
    *   On the application's homepage, click the upload area and select the `Takeout` folder you just unzipped.
    *   The application will begin processing your data.
