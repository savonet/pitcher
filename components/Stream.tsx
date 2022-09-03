import { useWebcastContext } from "@videocast/components/useWebcastContext"

const Stream = () => {
  return (
    <>
      <div>
        <video src="http://localhost:8001/stream" controls autoPlay={true}></video>
      </div>
    </>
  )
}

export default Stream
