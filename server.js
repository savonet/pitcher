var https = require("https")
var fs = require("fs")
const path = require("path")
const { parse } = require("url")

const next = require("next")
const port = 8080
const dev = true
const app = next({ dev, dir: __dirname })
const handle = app.getRequestHandler()

process.env.PITCHER_HOST = "pitcher.liquidsoap.info"

var options = {
  key: fs.readFileSync("/etc/letsencrypt/live/pitcher.liquidsoap.info/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/pitcher.liquidsoap.info/fullchain.pem"),
}

app.prepare().then(() => {
  https
    .createServer(options, (req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
    .listen(port, err => {
      if (err) throw err
      console.log(`> Ready on localhost:${port}`)
    })
})
