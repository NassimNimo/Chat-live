import React, { useEffect, useState } from 'react'
import './Chat.css';
import { IoSend } from "react-icons/io5";


function Chat({socket,userName}){
    const [currentMessage, setCurrentMessage] = useState("");
    const [room, setRoom]=useState("");
    const [currentRoom,setCurrentRoom]=useState("");
    const [messageList, setMessageList]=useState([])

    const joinRoom = ()=>{
        if(room !== ""){
            setCurrentRoom(room);
            socket.emit("join_room",{room});
        }
    }

    const sendMessage = async ()=>{
        if(currentMessage !==""){
            const messageData = {
                room : currentRoom,
                author: userName,
                message: currentMessage,
                time : new Date(Date.now()).getHours()+
                ":"+
                new Date(Date.now()).getMinutes(),
            };
            await socket.emit("send_message", messageData);
        }
    };

    useEffect(() => {
        console.log("socket change");
    
        // Subscribe to "receive_message" event
        socket.on("receive_message", handleMessageReceived);
    
        // Cleanup function to unsubscribe when component unmounts or when socket changes
        return () => {
            socket.off("receive_message", handleMessageReceived);
        };
    }, [socket]);
    
    const handleMessageReceived = (data) => {
        setMessageList((list) => [...list, data]);
    };

    return(
        <div className='chat-wrapper'>
            <div className='chat-side'>
                <div className="chat-header" >
                    <p>LiveChat</p>
                </div>
                <div className="chat-choice">
                    <nav>
                        <ul>
                            <li>Link 1</li>
                            <li>Link 2</li>
                            <li>Link 3</li>
                            <li>Link 4</li>
                            <li>Link 5</li>
                            <li>Link 6</li>
                            <li>Link 7</li>
                            <li>Link 8</li>
                            <li>Link 9</li>
                            <li>Link 10</li>
                            <li>Link 11</li>
                            <li>Link 13</li>
                        </ul>
                    </nav>
                </div>
                <div className="chat-join">
                    <input
                    type="text"
                    placeholder='room name...'
                    onChange={
                        (event)=>{
                            setRoom(event.target.value);
                        }}
                    />
                    <button onClick={joinRoom}>join room</button>
                </div>
            </div>
            
            <div className="chat-main">
                <div className='chat-text'>
                        {messageList.map((messageContent)=>{
                            return <h1 >{messageContent.message}</h1>
                        })}
                </div>
                <div className='chat-input'>
                    <input
                    type='text'
                    placeholder='...'
                    onChange = {
                        (event)=>{
                            setCurrentMessage(event.target.value);
                        }
                    }
                    />
                    <button onClick={sendMessage}><IoSend/></button>
                </div>
            </div>
        </div>
    )
}

export default Chat;