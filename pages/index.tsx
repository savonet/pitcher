import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Video from "@videocast/components/Video"
import Slides from "@videocast/components/Slides"
import HarborStream from "@videocast/components/HarborStream"
import Chat from "@videocast/components/Chat"
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
      <div>
        <HarborStream />
      </div>
      <div>
        <Chat />
      </div>
      <div className='col-span-full w-full max-w-lg'>
        <Connection />
      </div>
    </div>
  )
}

export default Home
