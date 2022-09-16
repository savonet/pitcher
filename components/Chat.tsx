import {useState} from 'react';

const Chat = () => {
  const [nick, setNick] = useState('Bob');
  const [messages, setMessages] = useState('');
  const [message, setMessage] = useState('');

  let updater = undefined;

  const update = async () => {
    // console.log("updating chat");
    // if (document.getElementById('chat-update').checked)
    const response = await fetch("http://localhost:8000" + "/chat/get", {mode: "no-cors"});
    const text = await response.text();
    console.log("chat contents: " + messages);
    setMessages(text);
    //updater = setTimeout(update, 1000);
  }

  updater = setTimeout(update, 0);

  const sendMessage = () => {
    if (message !== '') {
      setMessage('');
      const url = "http://localhost:8000" + "/chat/message";
      const data = `<${nick}> ${message}`;
      // console.log("Message: " + data);
      setMessages(messages + ((messages == "") ? "" : "\n") + data);
      fetch(url, {mode: "no-cors", method: "POST", body: data})
    }
  }

  const onChatKey = (event) => {
    if(event.key === 'Enter'){
      sendMessage();
    }
  }

  return (
    <>
      <div>
        <form onSubmit={event => event.preventDefault()}>
          <textarea id="chat" rows="20" value={messages} readOnly></textarea>
          <input id="chat-message" placeholder="Type your message here." value={message} onChange={event => setMessage(event.target.value)} onKeyPress={onChatKey}/>
        </form>

        <form onSubmit={event => event.preventDefault()}>
          <label>Nick in chat</label>
          <input id="chat-nick" defaultValue={nick} onChange={event => setNick(event.target.value)}/>
          <label>Update chat</label>
          <input id="chat-update" type="checkbox" defaultChecked/>
        </form>
      </div>
    </>
  )
}

export default Chat
