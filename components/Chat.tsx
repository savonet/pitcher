import { useState, useEffect, useCallback } from "react"

const Chat = () => {
  const [nick, setNick] = useState("Bob")
  const [sendDisabled, setSendDisabled] = useState(false)
  const [messages, setMessages] = useState("")
  const [message, setMessage] = useState("")

  const host = process.env.PITCHER_HOST || "localhost"

  useEffect(() => {
    const update = async () => {
      const response = await fetch(`https://${host}:8000/chat/get`)
      const text = await response.text()
      console.log("chat contents: " + text)
      setMessages(text)
    }

    const updater = setInterval(update, 1000)
    return () => clearInterval(updater)
  }, [setMessages])

  const sendMessage = useCallback(async () => {
    if (sendDisabled) return

    setSendDisabled(true)
    setMessage("")
    try {
      const url = `https://${host}:8000/chat/message`
      const data = `<${nick}> ${message}`
      setMessages(messages + (messages == "" ? "" : "\n") + data)
      await fetch(url, { mode: "no-cors", method: "POST", body: data })
    } finally {
      setSendDisabled(false)
    }
  }, [nick, messages, message, setMessage, sendDisabled, setSendDisabled])

  return (
    <>
      <div>
        <form onSubmit={event => event.preventDefault()}>
          <textarea id='chat' rows={20} value={messages} readOnly></textarea>
          <input
            id='chat-message'
            placeholder='Type your message here.'
            value={message}
            onChange={event => setMessage(event.target.value)}
          />
          <button
            type='submit'
            disabled={sendDisabled}
            onClick={event => {
              event.preventDefault()
              sendMessage()
            }}
          >
            Send Message
          </button>
        </form>

        <form onSubmit={event => event.preventDefault()}>
          <label>Nick in chat</label>
          <input id='chat-nick' defaultValue={nick} onChange={event => setNick(event.target.value)} />
        </form>
      </div>
    </>
  )
}

export default Chat
