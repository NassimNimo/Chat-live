import React, { useEffect, useState } from "react";
import "./Chat.css";
import { IoSend } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { CgLogOut } from "react-icons/cg";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, userName, setLogged, setUserName }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [room, setRoom] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [roomList, setRoomList] = useState({});
  const [role, setRole] = useState(false);

  const logOut = () => {
    setLogged(false);
    setUserName("");
    setCurrentMessage("");
    setRoom("");
    setCurrentRoom("");
    socket.emit("log-out", { currentRoom, userName });
  }

  const joinRoom = (join) => {
    if (join != null && join !== currentRoom) {
      setCurrentRoom(join);
      setMessageList([]);
      socket.emit("join_room", { room: join, currentRoom, userName });
      socket.emit("check_owner", { room: join, userName });
    }

  };

  function myFunction() {
    var dropdown = document.getElementById("myDropdown");
    if (dropdown.classList.contains("show")) {
      dropdown.classList.remove("show");
    } else {
      dropdown.classList.add("show");
    }
  }

  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  const addRoom = () => {
    if (room !== "") {
      if (!roomList.hasOwnProperty(room)) {
        setRoomList(prevState => ({
          ...prevState,
          [room]: "00"
        }));
        joinRoom(room);
      }
    }
  };

  const sendMessage = async () => {

    document.getElementById("message").value = "";
    setCurrentMessage("");
    document.getElementById("message").focus();
    if (currentMessage !== "") {
      const messageData = {
        room: currentRoom,
        author: userName,
        message: currentMessage,
        time:
          String(new Date(Date.now()).getHours()).padStart(2, "0") +
          ":" +
          String(new Date(Date.now()).getMinutes()).padStart(2, "0"),
      };
      await socket.emit("send_message", messageData);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("user role : ", role);
    }, 500);
  
    socket.emit("get_rooms");
  }, [])

  useEffect(() => {
    console.log("socket change");

    socket.on("receive_message", handleMessageReceived);

    socket.on("room_update", handleRoomUpdate);

    socket.on("get_log", handleGetLog);


    return () => {
      socket.off("receive_message", handleMessageReceived);
      socket.off("room_update", handleRoomUpdate);
      socket.off("get_log", handleGetLog);

    };
  }, [socket]);

  const handleMessageReceived = (data) => {
    setMessageList((list) => [...list, data]);
  };


  const handleRoomUpdate = (data) => {
    console.log(data);
    const { room, count } = data;
    if (room !== "" && room !== null && !roomList.hasOwnProperty(room)) {
      setRoomList(prevRoomList => ({
        ...prevRoomList,
        [room]: count
      }));
    }
  }

  const handleGetLog = (data) => {
    console.log(data)
    setMessageList(data);
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-side">
        <div className="chat-header">
          <h2>LiveChat</h2>
        </div>
        <div className="chat-choice">
          {Object.entries(roomList).map(([roomName, numberOfUsers]) => (
            <button onClick={() => joinRoom(roomName)} key={roomName} className='room-wrapper'>
              <p>{roomName}</p>
              <small><span><FaUserAlt /></span>: {numberOfUsers}</small>
            </button>
          ))}
        </div>
        <div className="chat-join">
          <input
            type="text"
            placeholder="room name..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
            onKeyPress={(e) => {
              e.key === 'Enter' && addRoom()
            }}
          />
          <button onClick={addRoom}>join room</button>
        </div>
      </div>
      <div className="chat-main">
        <div className="main-head">
          <h2>
            {userName} : : {currentRoom}
          </h2>
          <div className="dropdown">
            <button onClick={myFunction} className="dropbtn"><IoMdSettings /></button>
            <div id="myDropdown" className="dropdown-content">
              <a href="#">Option 1</a>
              <a href="#">Option 2</a>
              <a id="logOut" onClick={logOut}>Log-out <CgLogOut id="logOutIcon" /></a>
            </div>
          </div>
        </div>
        <div className="chat-text" id="chat-scroll">
          <ScrollToBottom className="message-container">
            {messageList.map((message) => {
              return message.author === "sys" ? (<div className="sys"><p>{message.message}</p></div>) : (
                <div className={
                  message.author !== userName
                    ? "other"
                    : "mine"
                }>
                  <div
                    className={
                      message.author !== userName
                        ? "message-wrapper"
                        : "message-wrapper my-wrapper"
                    }
                  >
                    {message.author !== userName ?
                      <small className="message-author">{message.author}</small> :
                      <small className="message-author">You</small>
                    }
                    <p className="message-body">{message.message}</p>
                    <small className="message-time">{message.time}</small>
                  </div>
                </div>
              );
            })}
          </ScrollToBottom>
        </div>
        <div className="chat-input">
          <input
            type="text"
            id="message"
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}
            onKeyPress={(e) => {
              e.key === 'Enter' && sendMessage()
            }}
          />
          <button type="submit" onClick={sendMessage}>
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
