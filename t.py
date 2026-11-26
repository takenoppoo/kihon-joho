from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':430,'height':900})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.getcwd()+'/index.html')
    pg.screenshot(path='/tmp/s_home.png')
    pg.goto('file://'+os.getcwd()+'/index.html#study'); pg.reload()
    pg.click('text=答えと解説を見る >> nth=0'); pg.screenshot(path='/tmp/s_study.png')
    pg.goto('file://'+os.getcwd()+'/index.html#test'); pg.reload()
    for i in range(3):
        pg.click('.ch >> nth=0'); pg.click('text=解答する'); 
        if i==0: pg.screenshot(path='/tmp/s_test.png')
        pg.click('button.btn.primary:visible')
    print(pg.inner_text('.meta'), errs)
    pg.goto('file://'+os.getcwd()+'/index.html#review'); pg.reload(); print(pg.inner_text('h1'))
    b.close()
