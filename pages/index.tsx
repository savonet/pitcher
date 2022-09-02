import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Video from "@videocast/components/Video"
import Slides from "@videocast/components/Slides"
import Connection from "@videocast/components/Connection"

const Home: NextPage = () => {
  return (
    <div className='p-8 grid grid-cols-2 gap-2 place-items-center'>
      <div className='justify-self-end'>
        <Slides />
      </div>
      <div className='self-start justify-self-start'>
        <Video />
      </div>
      <div className='col-span-full w-full max-w-lg'>
        <Connection />
      </div>
    </div>
  )
}

export default Home
