import React, {useEffect, useState, useRef, useReducer} from 'react';
import {Header, Inputs, UserBlock, PrevInput, NextInput, NextInputContainer, Username} from "./StyledElements"
import Websocket from 'react-websocket';
import randomColor from "randomcolor"; 
import rug from "./modules/randomUsername"
const socketUri = 'wss://ony69stm1j.execute-api.us-east-1.amazonaws.com/Prod'
const socketOptions = {};

const getUsernameFromConnectionId = (connectionId) => {
  let username = rug.setSeed(connectionId).generate();
  console.log(username, connectionId);
  return username;
}

let User = ({connectionId, messages, isCurrentUser, currentText, onChange, onKeyUp})=>{
  console.log(messages);
  return (<UserBlock connectionId={connectionId}>
          <Inputs >
            <PrevInput>{messages.join("")}</PrevInput>
            <NextInputContainer>
              <Username  >{isCurrentUser ? "YOU" : getUsernameFromConnectionId(connectionId)}:</Username>
              {isCurrentUser && 
                <NextInput type="text" value={currentText || ""} onKeyUp={onKeyUp} onChange={onChange} autoFocus/>
              }
            </NextInputContainer>
          </Inputs>
        </UserBlock>)
}


let App = () => {
  let [myConnectionId, setMyConnectionId] = useState(null);
  let [users, setUsers] = useState({});
  let [currentText, setCurrentText] = useState("");
  let socket = useRef();

  const addText = (connectionId, text) => {
    let newUsers = {...users};
    if(!newUsers[connectionId]){
      newUsers[connectionId] = [text];
    } else {
      newUsers[connectionId].push(text);
    }
    setUsers(newUsers);
  }

  const deleteText = (connectionId) => {
    let newUsers = {...users}
    if(newUsers[connectionId]){
      newUsers[connectionId].pop();
    }
    setUsers(newUsers);
  }

  const deleteUser = (connectionId) => {
    let newUsers = {...users}
    delete newUsers[connectionId];
    setUsers(newUsers);
  }

  let onKeyUp = (e) => {
    let isBackspace = e.key === "Backspace" || e.keyCode === 8;
    if(isBackspace && !e.target.value){
      sendMessage("[delete]");
    }
  }

  let onChange = (e)=>{
    let value = e.target.value;
    addText(myConnectionId, value);
    setCurrentText("");
    sendMessage(value);
  }
  
  let onOpen = (e, props) => {
    sendMessage("Hello World");
  }

  let sendMessage = (message)=>{
    socket.current.sendMessage(JSON.stringify({action: "sendmessage", text: message}));
  }

  let onMessage = (data)=>{
    let {connectionId, text} = JSON.parse(data);
    let isFirstConnection=false, isMyConnection=false;
    if(!myConnectionId){
      setMyConnectionId(connectionId);
      isFirstConnection = true;
      isMyConnection=true;
    }
    if(myConnectionId === connectionId){
      isMyConnection=true;
    }

    if(!isMyConnection || isFirstConnection){
      let action = {
        // "[welcome]": startSession,
        "[delete]" : deleteText,
        "[leave]" : deleteUser,
      }[text] || addText
      return action(connectionId, text);
    }
  }

  return (
    <div>
      <Websocket 
          ref={socket}
          url={socketUri}
          onOpen={onOpen}
          onMessage={onMessage}
      />
      <Header className="App-header">
        <h3>Welcome <strong>{getUsernameFromConnectionId(myConnectionId)}</strong></h3>```
      </Header>
      <div>
        {
          Object.entries(users).map(([userConnectionId, messages], i) => {
            let isCurrentUser = userConnectionId === myConnectionId;
            return <User key={i}
              connectionId={userConnectionId}
              messages={messages}
              isCurrentUser={isCurrentUser}
              currentText={currentText}
              onChange={onChange}
              onKeyUp={onKeyUp} /> 
          })
        }
      </div>
    </div>
  );
}


export default App
