# audioフォルダにある音声から、目録（manifest.json）を作り直します。VOICEVOXは要りません。
import json, os
m = {}
for fn in sorted(os.listdir("audio")):
    b, e = os.path.splitext(fn)
    if e in (".mp3", ".wav") and (b not in m or e == ".mp3"):
        m[b] = fn
json.dump(m, open("audio/manifest.json", "w"), ensure_ascii=False)
open("audio/manifest.js", "w", encoding="utf-8").write("window.AUDIO_MANIFEST=" + json.dumps(m, ensure_ascii=False) + ";")
print("目録を作り直しました:", len(m), "ファイル")
