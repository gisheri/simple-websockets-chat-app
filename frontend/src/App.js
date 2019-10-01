import React, {useEffect, useState, useRef, useReducer} from 'react';
// import logo from './logo.svg';
import './App.css';
import Sockette from "sockette"
import UsernameGenerator from "username-generator"
import styled from "styled-components"
// import produce from "immer"
import { useImmer } from "use-immer";

const UserBlock = styled.div`
  background-color:#222;
  color:#eee;
  padding:10px;
  margin-bottom:5px;
  text-align:left;
`

const Inputs = styled.div`
  text-align:center;
`

const PrevInput = styled.div`
  width:50%;
  color:#eee;
  padding:5px;
  display:inline-block;
  background:transparent;
  border:none;
  font-size:1em;
  text-align:right;
  box-sizing:border-box;
  overflow:hidden;
  height:30px;
`

const NextInput = styled.input`
  width:50%;
  color:#eee;
  padding:5px;
  background:transparent;
  border:none;
  font-size:1em;
  box-sizing:border-box;
`

const generateUsername = ()=>{
  return UsernameGenerator.generateUsername("-");
}

const openSocket = (options)=>{
  return new Sockette('wss://ony69stm1j.execute-api.us-east-1.amazonaws.com/Prod', options);
}

function App() {
  let socket = useRef(null);
  let connectionId = useRef(null);
  let [users, setUsers] = useImmer({});
  let [username, setUsername] = useState(generateUsername());
  let [messages, setMessages] = useState([]);
  let [currentText, setCurrentText] = useState("");

  useEffect(() => {
    socket.current = openSocket({
      timeout: 5e3,
      maxAttempts: 10,
      onopen: e => {
        console.log('Connected!', e);
        socket.current.json({
          action: 'sendmessage',
          data: JSON.stringify({text: "hello world", connectionId: connectionId})
        });
        // startInterval();
      },
      onmessage: handleMessage,
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => console.log('Closed!', e),
      onerror: e => console.log('Error:', e)
    })
  }, []);

  const handleMessage = (e)=>{
    let body = JSON.parse(e.data);
    let { text, connectionId } = body.data;
    switch(text){
      case "[X]":
          deleteText(connectionId);
          break;
      case "leave":
          deleteUser(connectionId);
          break;
      default:
          addText(connectionId, text)
          break;
    }
  }

  const addText = (connectionId, text) => {
    setUsers((users)=>{
      if(!users[connectionId]){
        users[connectionId] = [text];
      } else {
        users[connectionId].push(text);
      }
      return users;
    });
  }

  const deleteText = (connectionId) => {
    setUsers((users)=>{
      if(users[connectionId]){
          users[connectionId].pop()
      } 
      return users;
    });
    
  }

  const deleteUser = (connectionId) => {
    setUsers((users)=>{
      if(users[connectionId]){
        delete users[connectionId]
      }
      return users;
    });
  }

  
  
  let onKeyUp = (e) => {
    let isBackspace = e.key === "Backspace" || e.keyCode === 8;
    if(isBackspace && !e.target.value){
      socket.current.json({action: 'sendmessage', data: JSON.stringify({text: "[X]", connectionId: connectionId})});
    }
  }

  let onChange = (e)=>{
    let value = e.target.value;
    setCurrentText("");
    socket.current.json({action: 'sendmessage', data: JSON.stringify({text: value, connectionId: connectionId})});
  }
  
  console.log('rerendering')
  console.log(users);
  return (
    <div className="App">
      <header className="App-header">
        <h3>Welcome <strong>{connectionId}</strong></h3>
      </header>
      <div>
        {
          Object.entries(users).map(([m_connectionId, messages], i) => {
            return <UserBlock key={i}>
              <h4>{connectionId}:</h4>
              <Inputs>
                <PrevInput>{messages.join("")}</PrevInput>
                {m_connectionId === connectionId && 
                  <NextInput type="text" value={currentText || ""} onKeyUp={onKeyUp} onChange={onChange}/>
                }
              </Inputs>
            </UserBlock>
          })
        }
      </div>
    </div>
  );
}

export default App;
