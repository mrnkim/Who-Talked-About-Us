## 🔑 Getting Started

### Step 1. Generate API Key and Create .env File

1. Visit [Twelve Labs Playground](https://playground.twelvelabs.io/) to generate your API Key
   - Once you sign up, you'll receive complimentary credits allowing you to index up to 10 hours of video content!
2. Create `.env` file in the root directory and update the values for each key

   ```
    .env

    REACT_APP_API_URL=https://api.twelvelabs.io/v1.1
    REACT_APP_API_KEY=<YOUR API KEY>
    REACT_APP_SERVER_URL=<YOUR SERVER URL>
    REACT_APP_PORT_NUMBER=<YOUR PORT NUMBER>

   ```

   - You can simply copy-paste the above and customize the values
   - `REACT_APP_API_URL`: This app supports v1.1
   - `REACT_APP_API_KEY`: Store the API Key that you generated in the previous step
   - `REACT_APP_SERVER_URL`: It could be something like `http://localhost`
   - `REACT_APP_PORT_NUMBER`: Set a port number you want to use (e.g., `4001`)

### Step 2. Start the App

1. Clone the current repo
   ```sh
   git clone git@github.com:mrnkim/Who-Talked-About-Us.git
   ```
2. Start the server

   ```sh
   nodemon server.js
   ```

3. Install and start the client

   ```sh
   npm install
   npm start
   ```
