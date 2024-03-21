import React from "react";
import { useState } from 'react';


function JoinRoom(){
    const joinRoom = () => {
        if(room !== ""){
          socket.emit("join_room", room);
        }
      };

    return(
        <div>
            
        </div>
    );
}

export default JoinRoom;