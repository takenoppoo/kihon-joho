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

# --- VOICEVOXにつながるか確認 ---
try:
    urllib.request.urlopen(HOST + "/version", timeout=5).read()
except Exception as e:
    print("VOICEVOXにつながりません。VOICEVOXを起動してから、もう一度実行してください。")
    print("(", e, ")")
    sys.exit(1)
REDO = "--redo" in sys.argv  # STEPのある問題と、直した問題の音声だけを作り直す
FIXED_BASES = {"v02_ex29", "v06_ex82", "v06_ex85", "v08_ex106", "v10_ex140"}
def base_of(vol, q):
    return ("ex%d" % q["ex"]) if vol == 1 else ("v%02d_ex%d" % (vol, q["ex"]))
if REDO:
    n_del = 0
    for v in VOLS:
        for q in v["qs"]:
            b = base_of(v["vol"], q)
            if q.get("calc") or b in FIXED_BASES:
                for suf in ("", "_exp"):
                    for ext in (".mp3", ".wav"):
                        p = "audio/" + b + suf + ext
                        if os.path.exists(p):
                            os.remove(p); n_del += 1
    print("作り直すため、古い音声を", n_del, "個消しました")
JOBS = 4  # 同時に作る数。パソコンが重くなるときは 2 に、余裕があるときは 6 に
for a in sys.argv:
    if a.startswith("--jobs="): JOBS = int(a.split("=")[1])
from concurrent.futures import ThreadPoolExecutor
tasks = []
for v in sorted(VOLS, key=lambda v: v["vol"]):
    for q in sorted({q["ex"]: q for q in v["qs"]}.values(), key=lambda q: q["ex"]):
        tasks.append((v["vol"], q))

def extra(q, clean):
    r = []
    if q.get("steptext"): r.append(q["steptext"])
    if q.get("calc"):
        for st in q["calc"]: r.append("\n".join([st["t"]] + st["l"]))
    if q.get("errs"): r += [x if q.get("fixed") else re.sub("（[アイウエ]）", "", x) for x in q["errs"]]
    if q.get("fin"): r.append(q["fin"] if (not clean or q.get("fixed")) else re.sub("よって、答えは「[アイウエ]」の", "正解は、", q["fin"]))
    return r

def work(t):
    vol, q = t
    n = q["ex"]
    base = ("ex%d" % n) if vol == 1 else ("v%02d_ex%d" % (vol, n))  # 第1巻は従来の名前のまま
    full = "\n".join(["例題%d" % n, q["q"]] + ["%s、%s" % (MARK[i], "図" if t0.startswith("img:") else t0) for i, t0 in enumerate(q["choices"])] + ["答えは、%sです。" % MARK[q["ans"]], q["story"], q["meaning"]] + extra(q, False))
    r = {base: save(base, full)}
    mt = re.sub(r"よって、答えは「[アイウエ]」の「([\s\S]*)」です。", r"正解は、「\1」です。", q["meaning"])
    r[base + "_exp"] = save(base + "_exp", "\n".join([q["story"], mt] + extra(q, True)))
    print("done 第%d巻 例題%d" % (vol, n), flush=True)
    return r

manifest = {}
def safe_work(t):
    try:
        return work(t)
    except Exception as e:
        print("失敗 第%d巻 例題%d: %s" % (t[0], t[1]["ex"], e), flush=True)
        return {}
with ThreadPoolExecutor(max_workers=JOBS) as ex:
    for r in ex.map(safe_work, tasks):
        manifest.update(r)
# 今回作った分だけでなく、audioフォルダにある音声ぜんぶを目録に載せる（前の目録を上書きして消さないため）
for fn in os.listdir("audio"):
    b, e = os.path.splitext(fn)
    if e in (".mp3", ".wav") and (b not in manifest or e == ".mp3"):
        manifest[b] = fn
json.dump(manifest, open("audio/manifest.json", "w"), ensure_ascii=False)
open("audio/manifest.js", "w", encoding="utf-8").write("window.AUDIO_MANIFEST=" + json.dumps(manifest, ensure_ascii=False) + ";")
print("完了:", len(manifest), "ファイル")
