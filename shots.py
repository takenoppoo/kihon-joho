from playwright.sync_api import sync_playwright
import base64
U='file:///home/claude/kihon/index.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':430,'height':900},device_scale_factor=2)
    def go(h):
        pg.goto(U+h);pg.reload();pg.wait_for_timeout(500)
    go('');pg.screenshot(path='/tmp/p1.png')
    go('#study');pg.screenshot(path='/tmp/p2.png')
    go('#test');pg.click('.ch >> nth=1');pg.screenshot(path='/tmp/p3.png')
    pg.click('text=解答する');pg.wait_for_timeout(300);pg.screenshot(path='/tmp/p4.png',full_page=True)
    go('#review');pg.screenshot(path='/tmp/p5.png')
    b.close()
