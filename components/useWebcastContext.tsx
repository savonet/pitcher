import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { Socket } from "@webcast.js/socket"

type ConnectionOptions = {
  user: string
  password: string
  host: string
  port: number
  mount: string
  bitrate: number
  fps: number
  mimeType: string
  maxErrors: number
}

type WebcastContextType = {
  connectionOptions: ConnectionOptions
  setConnectionOptions: (_: ConnectionOptions) => void
  mediaStream?: MediaStream
  setVideoDeviceId: (_: ConstrainDOMString) => Promise<void>
  isReady: boolean
  isStreaming: boolean
  setIsStreaming: (_: boolean) => void
}

const initialConnectionOptions: ConnectionOptions = {
  user: "source",
  password: "hackme",
  host: process.env.PITCHER_HOST || "localhost",
  port: 8000,
  mount: "speaker",
  bitrate: 500,
  fps: 10,
  mimeType: "video/webm",
  maxErrors: 10,
}

const WebcastContext = createContext<WebcastContextType>({} as unknown as WebcastContextType)

const mkConnect = ({
  mediaStream,
  connectionOptions: { user, password, host, port, mount, fps, bitrate, mimeType, maxErrors },
}: {
  mediaStream: MediaStream
  connectionOptions: ConnectionOptions
}) => {
  const mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType,
    videoBitsPerSecond: bitrate * 1000,
  })

  let webcastSocket: Socket | undefined

  return (start: boolean, setIsStreaming: (state: boolean) => void) => {
    const close = () => {
      if (mediaRecorder.state === "recording") mediaRecorder.stop()
      if (webcastSocket && webcastSocket.socket && webcastSocket.socket.readyState === WebSocket.OPEN)
        webcastSocket.socket.close()
      webcastSocket = undefined
      setIsStreaming(false)
    }

    if (!start) return close()

    let connectCount = 0

    const connectWebcastSocket = () => {
      const onOpen = () => {
        connectCount = 0
        if (mediaRecorder.state !== "recording") mediaRecorder.start()
        setIsStreaming(true)
      }

      const onError = (event: Event) => {
        console.log("WebSocket error: ", event)
        if (connectCount++ <= maxErrors) {
          console.log(`Reconnecting... (${connectCount})`)
          connectWebcastSocket()
        } else {
          console.log("Maximum connection tries reached, aborting.")
          close()
        }
      }

      const proto = process.env.PITCHER_HOST ? "wss" : "ws"

      webcastSocket = new Socket({
        mediaRecorder,
        url: `${proto}://${user}:${password}@${host}:${port}/${mount}`,
        info: {},
        onOpen,
        onError,
      })
    }

    connectWebcastSocket()
  }
}

export const WebcastContextProvider = ({ children }: { children: ReactNode }) => {
  const [videoDeviceId, setVideoDeviceIdState] = useState<ConstrainDOMString | undefined>()
  const [mediaStream, setMediaStream] = useState<MediaStream | undefined>()
  const [connectionOptions, setConnectionOptions] = useState<ConnectionOptions>(initialConnectionOptions)
  const [isStreaming, setIsStreamingState] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const setVideoDeviceId = useCallback(
    async (deviceId: ConstrainDOMString) => {
      setVideoDeviceIdState(deviceId)

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: {
          deviceId: deviceId,
        },
      })

      setMediaStream(mediaStream)
      setIsReady(true)
    },
    [setVideoDeviceIdState, setMediaStream]
  )

  const connect = useMemo(
    () => (mediaStream ? mkConnect({ mediaStream, connectionOptions }) : undefined),
    [connectionOptions, mediaStream]
  )

  const setIsStreaming = useCallback(
    (state: boolean) => {
      if (!connect) return
      connect(state, setIsStreamingState)
    },
    [setIsStreamingState, connect]
  )

  const state = useMemo(
    () => ({
      connectionOptions,
      setConnectionOptions,
      mediaStream,
      setVideoDeviceId,
      isReady,
      isStreaming,
      setIsStreaming,
    }),
    [connectionOptions, setConnectionOptions, mediaStream, setVideoDeviceId, isReady, isStreaming, setIsStreaming]
  )

  return <WebcastContext.Provider value={state}>{children}</WebcastContext.Provider>
}

export const useWebcastContext = () => useContext(WebcastContext)
