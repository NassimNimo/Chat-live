import { IoPerson } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import React from 'react';
import { useState } from 'react';
import './LoginForm.css';


function LoginForm({socket,setLogged,userName,setUserName}){
    const [password, setPassword] = useState("");
    const [validLogin,setValidLogin]=useState(true);

    const LoginHandler= (e)=>{
        e.preventDefault();

        socket.emit("login",{userName,password});
        socket.on("logged",()=>{
            setValidLogin(true)
            setLogged(true);
        })
        socket.on("loggedError",()=>{
            setValidLogin(false)
        })
    }


    return(
        <div className='wrapper'>
            <form action="" onSubmit={LoginHandler}>
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder='Username'
                    onChange={(e)=>{
                        setUserName(e.target.value)
                    }}
                    required/>
                    <IoPerson className="icon"/>
                </div>
                <div className="input-box">
                    <input type="password" placeholder='Password'
                    onChange={(e)=>{
                        setPassword(e.target.value)
                    }}
                    required />
                    <FaLock className="icon"/>
                </div>
                {!validLogin && <p style={{ color: 'red' }}>Username or Password incorrect</p>}
                <button type='submit'>Login</button>
                <div className='register-link'>
                    <p>Don't have an account? <a href='/signup'>Sign-up</a></p>
                </div>
            </form>
        </div>
    )
}

export default LoginForm;