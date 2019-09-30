import React, {useEffect, useState, useRef, useReducer} from 'react';
// import logo from './logo.svg';
import './App.css';
import Sockette from "sockette"
import UsernameGenerator from "username-generator"
import styled from "styled-components"
import produce from "immer"
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
  return new Sockette('wss://a13iip6nq1.execute-api.us-east-1.amazonaws.com/Prod', options);
}

function App() {
  let socket = useRef(null);
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
        socket.current.json({message: 'sendmessage', data: JSON.stringify({action: "message", data: "hello world", user: username})});
        // startInterval();
      },
      onmessage: handleMessage,
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => console.log('Closed!', e),
      onerror: e => console.log('Error:', e)
    })
  }, []);

  const startInterval = () => {
    setInterval( ()=>{
      setCurrentText((text)=>{
        if(text && text.length){
          socket.current.json({message: 'sendmessage', data: JSON.stringify({action: "message", data: text, user: username})});

          return "";
        } else {
          return text;
        }
      });
    }, 400)
  }

  const addText = (username, text) => {
    setUsers((users)=>{
      if(!users[username]){
        users[username] = [text];
      } else {
        users[username].push(text);
      }
      return users;
    });
  }

  const deleteText = (username) => {
    setUsers((users)=>{
      if(users[username]){
          users[username].pop()
      } 
      return users;
    });
    
  }

  const deleteUser = (username) => {
    setUsers((users)=>{
      if(users[username]){
        delete users[username]
      }
      return users;
    });
  }

  const handleMessage = (e)=>{
    let body = JSON.parse(e.data);
    switch(body.action){
      case "message":
          addText(body.user, body.data)
          break;
      case "delete":
          deleteText(body.user);
          break;
      case "leave":
          deleteUser(body.user);
          break;
    }
  }
  
  let onKeyUp = (e) => {
    let isBackspace = e.key === "Backspace" || e.keyCode === 8;
    if(isBackspace && !e.target.value){
      socket.current.json({message: 'sendmessage', data: JSON.stringify({action: "delete", data: null, user: username})});
    }
  }

  let onChange = (e)=>{
    let value = e.target.value;
    setCurrentText("");
    socket.current.json({message: 'sendmessage', data: JSON.stringify({action: "message", data: value, user: username})});
  }
  
  console.log('rerendering')
  console.log(users);
  return (
    <div className="App">
      <header className="App-header">
        <h3>Welcome <strong>{username}</strong></h3>
      </header>
      <div>
        {
          Object.entries(users).map(([user, messages], i) => {
            return <UserBlock key={i}>
              <h4>{user}:</h4>
              <Inputs>
                <PrevInput>{messages.join("")}</PrevInput>
                {user === username && 
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
