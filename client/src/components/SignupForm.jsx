import './LoginForm.css'
import { useEffect, useState } from 'react';
import { IoPerson } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { FaUnlock } from "react-icons/fa";


function SignupForm({socket}){
    const [validUserName, setValidUserName] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);


    const SignupHandler = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            const signupData = {
                username: userName,
                password: password
            };
            socket.emit('signup', signupData);
            setPasswordsMatch(true);
        } else {
            setPasswordsMatch(false);
            return; // Exit early if passwords don't match
        }
    };
    
    // Use a separate useEffect to handle socket events
    useEffect(() => {
        const handleValid = () => {
            setValidUserName(true);
            
        };
    
        const handleNotValid = () => {
            setValidUserName(false);
        };
    
        socket.on("valid", handleValid);
        socket.on("notvalid", handleNotValid);
    
        // Clean up event listeners when the component unmounts
        return () => {
            socket.off("valid", handleValid);
            socket.off("notvalid", handleNotValid);
        };
    }, []); // Empty dependency array to run this effect only once after initial render
    

    return(
        <div className='wrapper'>
            <form action= "" onSubmit={SignupHandler}>
                <h1>Sign up</h1>
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
                    <FaUnlock className="icon"/>
                </div>
                <div className="input-box">
                    <input type="password" placeholder='Confirm Password'
                    onChange={(e)=>{
                        setConfirmPassword(e.target.value)
                    }}
                    required />
                    <FaLock className="icon"/>
                </div>
                    {!passwordsMatch && <p style={{ color: 'red' }}>Passwords do not match</p>}
                    {validUserName === true ? (
                            <p style={{ color: 'green' }}>New user created</p>
                        ) : validUserName === false ? (
                            <p style={{ color: 'red' }}>Invalid username</p>
                        ) : null}
                <button type='submit'>Sign up</button>
                <div className='register-link'>
                    <p>Already have an account? <a href='/'>Log-in</a></p>
                </div>
            </form>
        </div>
    )
}

export default SignupForm;