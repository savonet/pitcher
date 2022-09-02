import { useWebcastContext } from "@videocast/components/useWebcastContext"
import { useEffect, useRef, useState } from "react"

const Video = () => {
  const { mediaStream, setVideoDeviceId } = useWebcastContext()
  const [webcams, setWebcams] = useState<MediaDeviceInfo[]>([])
  const videoElement = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const fn = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()

      if (0 <= devices.length) setVideoDeviceId(devices[0].deviceId)

      setWebcams(devices.filter(({ kind }) => kind === "videoinput"))
    }

    void fn()
  }, [setWebcams, setVideoDeviceId])

  useEffect(() => {
    if (!mediaStream) return
    if (!videoElement.current) return

    videoElement.current.srcObject = mediaStream
  }, [mediaStream, videoElement])

  return (
    <div className='grid place-items-center'>
      {mediaStream && (
        <div>
          <video ref={videoElement} autoPlay={true} controls muted></video>
        </div>
      )}
      <div className='inline-block relative w-64 my-2'>
        <select
          onChange={e => setVideoDeviceId(e.target.value)}
          className='block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline'
        >
          {webcams.map(({ deviceId, label }, idx) => (
            <option key={deviceId} value={deviceId}>
              {label || `Camera ${idx + 1}`}
            </option>
          ))}
        </select>
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
          <svg className='fill-current h-4 w-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
            <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Video
