# 使い方: VOICEVOXを起動したまま、このフォルダで  python gen_voice.py
# 出力: audio/ex1.mp3 ... と audio/manifest.json（ffmpegが無ければwav）
import json, re, io, wave, shutil, subprocess, urllib.request, urllib.parse, os, sys
FORCE = "--force" in sys.argv  # 付けると、作ってある音声も作り直す
HOST = "http://127.0.0.1:50021"
SPEAKER = 3  # ずんだもん（ノーマル）。他の声にしたいときは番号を変える
MARK = "アイウエ"
import glob
VOLS = []
for fn in sorted(glob.glob("data_vol*.js")):
    s = open(fn, encoding="utf-8").read()
    VOLS.append(json.loads(s[s.index(".push(") + 6 : s.rindex(");")]))
os.makedirs("audio", exist_ok=True)
ffmpeg = shutil.which("ffmpeg")

def post(path, data=None, ctype=None):
    req = urllib.request.Request(HOST + path, data=data, method="POST")
    if ctype: req.add_header("Content-Type", ctype)
    return urllib.request.urlopen(req).read()

def synth(sentence):
    q = post("/audio_query?" + urllib.parse.urlencode({"text": sentence, "speaker": SPEAKER}))
    return post("/synthesis?speaker=%d" % SPEAKER, q, "application/json")

def speak_lines(text):
    out = io.BytesIO(); w = None
    for line in [l.strip() for l in text.split("\n") if l.strip()]:
        wav = wave.open(io.BytesIO(synth(line)))
        if w is None:
            w = wave.open(out, "wb"); w.setparams(wav.getparams())
        w.writeframes(wav.readframes(wav.getnframes()))
        w.writeframes(b"\x00\x00" * int(wav.getframerate() * 0.35))  # 文の間のすき間
    w.close(); return out.getvalue()

def save(name, text):
    for ext in (".mp3", ".wav"):
        if not FORCE and os.path.exists("audio/" + name + ext):
            return name + ext  # 作ってあるものは飛ばす
    wav = speak_lines(text)
    if ffmpeg:
        p = subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", "-", "-b:a", "64k", "-f", "mp3", "-"], input=wav, capture_output=True, check=True)
        fn, data = name + ".mp3", p.stdout
    else:
        fn, data = name + ".wav", wav
    open("audio/" + fn, "wb").write(data); return fn

manifest = {}
for v in sorted(VOLS, key=lambda v: v["vol"]):
    for q in sorted({q["ex"]: q for q in v["qs"]}.values(), key=lambda q: q["ex"]):
        n = q["ex"]
        base = ("ex%d" % n) if v["vol"] == 1 else ("v%02d_ex%d" % (v["vol"], n))  # 第1巻は従来の名前のまま
        full = "\n".join(["例題%d" % n, q["q"]] + ["%s、%s" % (MARK[i], "図" if t.startswith("img:") else t) for i, t in enumerate(q["choices"])] + ["答えは、%sです。" % MARK[q["ans"]], q["story"], q["meaning"]])
        manifest[base] = save(base, full)
        mt = re.sub(r"よって、答えは「[アイウエ]」の「([\s\S]*)」です。", r"正解は、「\1」です。", q["meaning"])
        manifest[base + "_exp"] = save(base + "_exp", q["story"] + "\n" + mt)
        print("done 第%d巻 例題%d" % (v["vol"], n))
json.dump(manifest, open("audio/manifest.json", "w"), ensure_ascii=False)
open("audio/manifest.js", "w", encoding="utf-8").write("window.AUDIO_MANIFEST=" + json.dumps(manifest, ensure_ascii=False) + ";")
print("完了:", len(manifest), "ファイル")
