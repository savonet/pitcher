#!../liquidsoap/liquidsoap
#!/bin/env -S liquidsoap

width = 1280
height = 720
height_chat = 60
width_cam = height/3
height_cam = height/3

buffer = 0.1

log.level.set(3)
video.frame.width.set(width)
video.frame.height.set(height)

### The server

ssl_certificate = environment.get("SSL_CERT_PATH")
ssl_key = environment.get("SSL_KEY_PATH")
port = environment.get("PORT") ?? 8000

transport =
  if null.defined(ssl_certificate) and null.defined(ssl_key) then
    http.transport.ssl(
      certificate=null.get(ssl_certificate),
      key=null.get(ssl_key)
    )
  else
    http.transport.unix
  end

harbor.http.middleware.register(harbor.http.middleware.cors(allowed_headers=["*"]))

def replaces harbor.http.register(~method="GET", path, handler) =
  if method != "OPTIONS" then
    harbor.http.register(transport=transport, port=port, method="OPTIONS", fun (_, _) -> ())
  end
  harbor.http.register(transport=transport, port=port, method=method, path, handler)
end

def content_type(fname)
  if string.contains(suffix=".html", fname) then "text/html"
  elsif string.contains(suffix=".css", fname) then "text/css"
  elsif string.contains(suffix=".js", fname) then "text/javascript"
  else "text/plain"
  end
end
harbor.http.static(transport=transport, content_type=content_type, path="/speaker", ".")

interactive.harbor(transport=transport)

### The slideshow

timeout = interactive.int("slides.timeout", description="Timeout for converting slides (in seconds).", 180.)

# Convert a pdf to a list of png files.
def pdf2png(~timeout=timeout,pdf)
  dir = file.temp_dir("liqpdf")
  log("processing pdf file")
  if process.test(timeout=getter.get(timeout), process.quote.command("pdftoppm", args=["-progress", "-png", pdf, "#{dir}/slide-"])) then
    file.ls(absolute=true, sorted=true, dir)
  else
    log.important("Conversion of pdf to png failed.")
    []
  end
end
# slides = video.color(0x00ff00)
png = pdf2png("liquidsoap.pdf")
# print("png files: #{png}")
slides = video.slideshow(png)

# Move slides
def advance(next)
  fun (_, _) -> begin
    if next then log.info("Going to the next slide.") else log.info("Going to the previous slide.") end
    if next then slides.next() else slides.prev() end
  end
end
harbor.http.register("/previous", advance(false))
harbor.http.register("/next", advance(true))
interactive.unit("slides.prev", description="Go to the previous slide.", slides.prev)
interactive.unit("slides.next", description="Go to the next slide.", slides.next)

# Current slide
def slide(_, res)
  res.content_type("image/png")
  res.data(file.read(slides.current()))
end
harbor.http.register("/slide", slide)

slides_ready = ref(false)
def slides_ready_handler(_, res) =
  res.json({ready = !slides_ready})
end
harbor.http.register("/slides_ready", slides_ready_handler)

# Upload slides
def upload(req, _)
  fname = file.temp("liq", ".pdf")
  file.write(data=req.data, fname)

  thread.run(fun () -> begin
    png = pdf2png(fname)
    if png != [] then
      log.important("Adding #{list.length(png)} slides")
      slides.append(png)
      slides_ready := true
    end
  end)
end
harbor.http.register(method="POST", "/upload", upload)

### The speaker

speaker = input.harbor(transport=transport, buffer=buffer, "speaker", port=8000)
speaker = video.crop(speaker)
speaker = fallback(track_sensitive=false, [speaker, video.color(0x0000ff)])

### Guests

guest1 = input.harbor(transport=transport, buffer=buffer, "guest1", port=8000)
guest1 = video.crop(guest1)
# guest1 = fallback(track_sensitive=false, [guest1, video.color(0x00ff00)])

guest2 = input.harbor(transport=transport, buffer=buffer, "guest2", port=8000)
guest2 = video.crop(guest2)
# guest2 = fallback(track_sensitive=false, [guest2, video.color(0xff0000)])

### The chat

chat = ref([])

interactive.unit("chat.clear", description="Clear the contents of the chat.", fun(_) -> chat := [])

def chat_message(req, _)
  chat := req.data :: !chat
  chat := list.prefix(100, !chat)
end
harbor.http.register(method="POST", "/chat/message", chat_message)

def chat(n=1000)
  chat = list.prefix(n, !chat)
  string.concat(separator="\n", list.rev(chat))
end

def chat_get(_, res)
  res.data(chat())
end
harbor.http.register("/chat/get", chat_get)

chat = video.text(size=15, color=0x000000, {chat(3)})

### Combine everybody

slides = video.crop(slides)
slides = video.resize(proportional=true, width=width-width_cam, height=height-height_chat, slides)
slides = video.align(top=true, slides)

speaker = video.resize(proportional=true, width=width_cam, height=height_cam, speaker)

# TODO: the following makes a segv when changing the value...
# swap = interactive.bool("swap-speaker-slides", description="Swap speaker and slides.", false)
# slides' = slides
# slides = source.dynamic({if swap() then speaker else slides end})
# speaker = source.dynamic({if swap() then slides' else speaker end})

speaker = video.align(top=true, right=true, speaker)
speaker = video.translate(x=width-width_cam, speaker)

guest1 = video.resize(proportional=true, width=width_cam, height=height_cam, guest1)
guest1 = video.align(right=true, guest1)
guest1 = video.translate(x=width-width_cam, y=height_cam, guest1)

guest2 = video.resize(proportional=true, width=width_cam, height=height_cam, guest2)
guest2 = video.align(bottom=true, right=true, guest2)
guest2 = video.translate(x=width-width_cam, y=2*height_cam, guest2)

chat = video.viewport(chat)
chat = video.align(bottom=true, chat)
chat = video.translate(y=-5, chat)

bg = video.color(0xeeeeee)

s = add([bg, slides, guest1, guest2, speaker, chat])

### Encode

#output.graphics(mksafe(s))

ytkey = string.trim(file.contents("youtube-key"))
ytenc = %ffmpeg(
#  format="mpegts",
  format="flv",
  fflags="nobuffer",
  flags="low_delay",
  %audio(codec="aac"),
  %video(codec="libx264",
         preset="ultrafast",
         tune="zerolatency")
)
#ytenc = %ffmpeg(format="mpegts", %audio(codec="aac", samplerate=44100, q=5), %video(codec="libx264", width=width, height=height, b="800k", g=50, preset="veryfast"))

# enc = %ffmpeg(format="mpegts", %audio(codec="aac", samplerate=44100, q=5), %video(codec="libx264", width=width, height=height, b="800k", g=50, preset="veryfast"))
# enc = %ffmpeg(format="webm", %audio(codec="libopus", samplerate=24000), %video(codec="libvpx-vp9", deadline="realtime"))

# output.harbor.hls(path="stream", port=8001, streams_info=[], [("video/webm",enc)], s)

output.youtube.live.rtmp(key=ytkey, encoder=ytenc, mksafe(s))
#output.youtube.live.hls(
#  segment_duration=0.01,
#  key=ytkey,
#  encoder=ytenc,
#  mksafe(s)
#)
#output.dummy(mksafe(s))
