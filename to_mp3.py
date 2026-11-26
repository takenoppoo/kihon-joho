# audioフォルダのwavをmp3(64k)にして、容量を小さくします。ffmpegが必要です。
import glob, json, os, shutil, subprocess, sys
ff = shutil.which("ffmpeg")
if not ff:
    print("ffmpeg is not installed. Run:  winget install Gyan.FFmpeg   then open a new cmd window."); sys.exit(1)
n = 0
for f in glob.glob("audio/*.wav"):
    m = f[:-4] + ".mp3"
    subprocess.run([ff, "-y", "-loglevel", "error", "-i", f, "-ac", "1", "-b:a", "64k", m], check=True)
    os.remove(f); n += 1
mf = "audio/manifest.json"
man = json.load(open(mf, encoding="utf-8")) if os.path.exists(mf) else {}
man = {k: (v[:-4] + ".mp3" if v.endswith(".wav") else v) for k, v in man.items()}
json.dump(man, open(mf, "w", encoding="utf-8"), ensure_ascii=False)
open("audio/manifest.js", "w", encoding="utf-8").write("window.AUDIO_MANIFEST=" + json.dumps(man, ensure_ascii=False) + ";")
print("converted:", n, "files")
