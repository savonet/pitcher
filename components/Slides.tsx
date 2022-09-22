import { useCallback, useEffect, useState, useRef } from "react"
import { useWebcastContext } from "@videocast/components/useWebcastContext"

const uploadSlides = ({ baseUrl, file }: { baseUrl: string; file: File }) =>
  fetch(`${baseUrl}/upload`, { method: "POST", body: file })

const Slides = () => {
  const [isReady, setIsReady] = useState(true)
  const [slideCounter, setSlideCounter] = useState(0)
  const {
    connectionOptions: { host, useSSL, port },
  } = useWebcastContext()
  const inputRef = useRef<HTMLInputElement>(null)

  const proto = useSSL ? "https" : "http"
  const baseUrl = `${proto}://${host}:${port}`

  /*
  useEffect(() => {
    let handler: ReturnType<typeof setTimeout> | undefined

    const clear = () => {
      if (!handler) return
      clearTimeout(handler)
      handler = undefined
    }

    const poll = async () => {
      const result = await fetch(`${baseUrl}/slides_ready`)
      const { ready } = await result.json()
      setIsReady(ready)
      if (ready) return clear()
      handler = setTimeout(poll, 300)
    }

    handler = setTimeout(poll, 300)

    return clear
  }, [setIsReady, baseUrl])
*/

  const onChange = useCallback(() => {
    if (!inputRef.current) return
    if (!inputRef.current.files) return
    if (inputRef.current.files.length === 0) return
    void uploadSlides({ baseUrl, file: inputRef.current.files[0] })
  }, [baseUrl, inputRef])

  const onPrevious = useCallback(async () => {
    setIsReady(false)

    try {
      await fetch(`${baseUrl}/previous`)
      setSlideCounter(slideCounter - 1)
    } finally {
      setIsReady(true)
    }
  }, [setIsReady, setSlideCounter, slideCounter, baseUrl])

  const onNext = useCallback(async () => {
    setIsReady(false)

    try {
      await fetch(`${baseUrl}/next`)
      setSlideCounter(slideCounter + 1)
    } finally {
      setIsReady(true)
    }
  }, [setIsReady, setSlideCounter, slideCounter, baseUrl])

  return (
    <>
      <img src={`${baseUrl}/slide?${slideCounter}`} />
      <div className='grid grid-cols-2 gap-2 my-4'>
        <div className='justify-self-end'>
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              !isReady ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isReady}
            type='button'
            onClick={onPrevious}
          >
            Previous
          </button>
        </div>
        <div className='justify-self-start'>
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              !isReady ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isReady}
            type='button'
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>

      <div className='grid place-items-center'>
        <div className='w-full max-w-sm rounded-lg overflow-hidden border border-gray-400 flex justify-center p-3 bg-neutral-50'>
          <form className='w-full max-w-sm'>
            <div className='md:flex md:items-center'>
              <div className='md:w-1/3'>
                <label className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'>Upload Slides</label>
              </div>
              <div className='md:w-2/3'>
                <input
                  className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
                  type='file'
                  ref={inputRef}
                  onChange={onChange}
                  accept='application/pdf,application/x-pdf,.pdf'
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Slides
