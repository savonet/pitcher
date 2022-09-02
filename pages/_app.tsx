import "@videocast/styles/globals.css"
import type { AppProps } from "next/app"
import { WebcastContextProvider } from "@videocast/components/useWebcastContext"

function Videocast({ Component, pageProps }: AppProps) {
  return (
    <WebcastContextProvider>
      <Component {...pageProps} />
    </WebcastContextProvider>
  )
}

export default Videocast
