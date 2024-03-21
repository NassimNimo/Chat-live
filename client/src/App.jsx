import './App.css';
import io from 'socket.io-client'
import LoginForm from './components/LoginForm.jsx';
import SignupForm from './components/SignupForm.jsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Chat from './components/Chat.jsx';
import { useState } from 'react';

const serverIP = "localhost"

const socket = io.connect("http://"+serverIP+":3001");

function App() {

  const [logged,setLogged]=useState(false);
  const [userName, setUserName] = useState("");

  const router = createBrowserRouter([
    {
      path: "/",
      element: logged ? <Chat setLogged={setLogged} socket={socket} setUserName={setUserName} userName={userName} /> : <LoginForm socket={socket} setLogged={setLogged} userName={userName} setUserName={setUserName}/>,
    },
    {
      path: "/signup",
      element: <SignupForm socket={socket} />,
    }
  ]);




  return (

    <div className="App">
      <RouterProvider router={router}/>
    </div>
  );
}

export default App;
