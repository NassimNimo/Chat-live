# Live Chat Application

This is a simple live chat application built using [Node.js](https://nodejs.org/) and [Socket.io](https://socket.io/) and [React](https://react.dev/) and [MongoDB](https://www.mongodb.com/) for real-time communication. Users can join chat rooms, send messages, and view messages from other users in real time. The logs of the Chats are stored in a MongoDB database.

## Features

- **Real-time Communication:** Messages are delivered instantly using Socket.io for real-time communication.
- **Multiple Chat Rooms:** Users can join different chat rooms and engage in discussions based on their interests or topics.
- **User Authentication:** Users can sign up, log in, and participate in the chat using their unique credentials.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/NassimNimo/Chat-live
    ```

2. Navigate to the project directories and start the front-end and back-end:

    ```bash
    cd client

    or

    cd ../server
    ```

3. Install dependencies for each one with:

    ```bash
    npm install
    ```

4. Set up environment variables:
   
    Create a `.env` file in the root directory and add the following variables:

    ```plaintext
    PORT=3000
    ```

5. Start the servers:

    ```bash
    cd client
    npm start
    cd ../server
    npm start
    ```

6. Open your web browser and navigate to `http://localhost:3000` to access the application.

## Usage

1. **Sign Up/Log In:** If you are a new user, sign up with a unique username and password. If you are an existing user, log in with your credentials.

2. **Join Chat Room:** Choose a chat room from the list of available rooms or create a new one.

3. **Chatting:** Start sending messages in the chat room. Your messages will be displayed in real time to other users in the same room.

4. **Leave Chat Room:** You can leave the chat room at any time and join another room or create a new one.

5. **Logout:** When you're done, log out from your account to securely end your session.
