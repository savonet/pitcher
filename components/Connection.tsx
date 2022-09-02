import { useWebcastContext } from "@videocast/components/useWebcastContext"

const Connection = () => {
  const { isStreaming, setIsStreaming, isReady, connectionOptions, setConnectionOptions } = useWebcastContext()
  const { user, password, host, port, mount, bitrate, fps } = connectionOptions

  const onChange =
    (field: keyof typeof connectionOptions, numeric = false) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setConnectionOptions({ ...connectionOptions, [field]: numeric ? Number(e.target.value) : e.target.value })

  return (
    <>
      <div className='grid grid-cols-2 gap-2 mb-4'>
        <div className='justify-self-end'>
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              !isReady || isStreaming ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isReady || isStreaming}
            onClick={() => setIsStreaming(true)}
            type='button'
          >
            Start Presentation
          </button>
        </div>
        <div className='justify-self-start'>
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              !isReady || !isStreaming ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isReady || !isStreaming}
            onClick={() => setIsStreaming(false)}
            type='button'
          >
            Stop Presentation
          </button>
        </div>
      </div>
      <div className='w-full rounded-lg overflow-hidden border border-gray-400 flex justify-center p-8 bg-neutral-50'>
        <form className='w-full max-w-lg'>
          <div className='flex flex-wrap -mx-3 mb-6'>Media Settings</div>
          <div className='flex flex-wrap -mx-3 mb-6'>
            <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
              <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>FPS</label>
              <input
                className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
                type='number'
                value={fps}
                onChange={onChange("fps", true)}
              />
            </div>
            <div className='w-full md:w-1/2 px-3'>
              <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Bitrate</label>
              <input
                className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                type='number'
                value={bitrate}
                onChange={onChange("bitrate", true)}
                step={100}
              />
            </div>
          </div>
          <div className='flex flex-wrap -mx-3 mb-6'>Connection Settings</div>
          <div className='flex flex-wrap -mx-3 mb-6'>
            <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
              <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Server</label>
              <input
                className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
                type='text'
                value={host}
                onChange={onChange("host")}
              />
            </div>
            <div className='w-full md:w-1/2 px-3'>
              <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Port</label>
              <input
                className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                type='number'
                value={port}
                onChange={onChange("port", true)}
              />
            </div>
          </div>
          <div className='flex flex-wrap -mx-3 mb-6'>
            <div className='w-full px-3'>
              <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>User</label>
              <input
                className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                type='text'
                value={user}
                onChange={onChange("user")}
              />
              <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Password</label>
              <input
                className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                type='password'
                value={password}
                onChange={onChange("password")}
              />
              <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Mountpoint</label>
              <input
                className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                type='text'
                value={mount}
                onChange={onChange("mount")}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default Connection
