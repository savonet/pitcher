import { useState, useEffect, useCallback } from "react"
import { useWebcastContext } from "@videocast/components/useWebcastContext"

const Chat = () => {
  const [nick, setNick] = useState("Bob")
  const [sendDisabled, setSendDisabled] = useState(false)
  const [messages, setMessages] = useState("")
  const [message, setMessage] = useState("")
  const {
    connectionOptions: { host, useSSL, port },
  } = useWebcastContext()

  const protocol = useSSL ? "https" : "http"
  const baseUrl = `${protocol}://${host}:${port}`

  useEffect(() => {
    const update = async () => {
      const response = await fetch(`${baseUrl}/chat/get`)
      const text = await response.text()
      //console.log("chat contents: " + text)
      setMessages(text)
    }

    const updater = setInterval(update, 1000)
    return () => clearInterval(updater)
  }, [setMessages, baseUrl])

  const sendMessage = useCallback(async () => {
    if (sendDisabled) return

    setSendDisabled(true)
    setMessage("")
    try {
      const url = `${baseUrl}/chat/message`
      const data = `<${nick}> ${message}`
      setMessages(messages + (messages == "" ? "" : "\n") + data)
      await fetch(url, { method: "POST", body: data })
    } finally {
      setSendDisabled(false)
    }
  }, [baseUrl, nick, messages, message, setMessage, sendDisabled, setSendDisabled])

  return (
    <>
      <div>
        <form autoComplete="off" onSubmit={event => event.preventDefault()}>
          <textarea id='chat' rows={20} cols={80} value={messages} readOnly></textarea>
          <input
            id='chat-message'
            type='text'
            size='80'
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
          <label>Nickname : </label>
          <input id='chat-nick' defaultValue={nick} onChange={event => setNick(event.target.value)} />
        </form>
      </div>
    </>
  )
}

export default Chat
