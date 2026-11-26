from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':430,'height':900})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.getcwd()+'/index.html#study'); pg.reload()
    print(pg.locator('.spk').count(), pg.locator('button:has-text("答えと解説")').count())
    pg.click('.spk >> nth=0'); pg.screenshot(path='/tmp/s2.png')
    pg.goto('file://'+os.getcwd()+'/index.html#test'); pg.reload()
    pg.click('.ch >> nth=0'); pg.click('text=解答する'); print(pg.locator('.spk').count(), errs)
    b.close()
