#!/usr/bin/env python3
"""Pre-deploy checks for sakhilebhayi.com. Exits non-zero (and prints why) if anything would ship broken.
Run from the repo root:  python3 scripts/check-site.py
Checks: required files, JSON-LD parses, every local src/href/srcset target exists, no duplicate ids,
sitemap addresses map to files, no dev folders tracked, and a few owner wording rules (see FORBIDDEN)."""
import json, os, re, subprocess, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
PAGES = ['index.html', 'work/index.html', 'approach/index.html', 'about/index.html', 'contact/index.html', '404.html']
REQUIRED = PAGES + ['.htaccess', 'robots.txt', 'sitemap.xml', 'site.css', 'site.js', 'assets/js/motion.js',
                    'assets/js/gsap.min.js', 'assets/js/ScrollTrigger.min.js', 'llms.txt', 'og-image.png']
DEV = ('design-options/', 'design-research/', '.final-shots/', '.workflow/', '.private/', '.impeccable/', 'PRODUCT.md', 'DESIGN.md')
# Owner wording decisions (2026-10-22). A page that brings one back should not go live by accident.
FORBIDDEN = [
    (r'one sign-in|single sign-on|\bone login\b', 'the site never calls InfoDot or the Dot.Eco-system a sign-in or login'),
    (r'AI coding agents|co-author', 'the AI build is only hinted ("AI-native", "AI-assisted")'),
    (r'guardian', 'Guardian is Dot.Brain'),
    (r'ISO 15143|\bBell\b', 'no Bell / ISO 15143-3 wording'),
    (r'pre-revenue|no verified users|no users yet|no client results', 'no volunteered "no users / pre-revenue" lines'),
    (r'\bblupin', 'BluPin stays off the site until its sites are corrected'),
]
errors = []
def err(msg): errors.append(msg)

for f in REQUIRED:
    if not os.path.isfile(f): err(f'missing required file: {f}')

tracked = subprocess.run(['git', 'ls-files'], capture_output=True, text=True).stdout.split('\n') if os.path.isdir('.git') else []
for t in tracked:
    if t.startswith(DEV): err(f'dev/private file is tracked: {t}')

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.ids = []; self.ld = []; self._ld = False; self.text = []; self._skip = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        for k in ('href', 'src'):
            if a.get(k): self.refs.append(a[k])
        for k in ('srcset', 'imagesrcset'):
            if a.get(k): self.refs += [x.strip().split(' ')[0] for x in a[k].split(',') if x.strip()]
        if tag == 'script' and a.get('type') == 'application/ld+json': self._ld = True; self.ld.append('')
        if tag in ('script', 'style'): self._skip += 1
    def handle_endtag(self, tag):
        if tag == 'script': self._ld = False
        if tag in ('script', 'style') and self._skip: self._skip -= 1
    def handle_data(self, d):
        if self._ld: self.ld[-1] += d
        elif not self._skip: self.text.append(d)

def exists(ref):
    path = re.split(r'[?#]', ref)[0]
    if not path.startswith('/') or path.startswith('//'): return True
    rel = path.lstrip('/')
    if rel == '' or rel.endswith('/'): rel += 'index.html'
    return os.path.isfile(rel)

for page in PAGES:
    if not os.path.isfile(page): continue
    src = open(page, encoding='utf-8').read()
    p = P(); p.feed(src)
    for ref in p.refs:
        if not exists(ref): err(f'{page}: broken local reference {ref}')
    dup = sorted({i for i in p.ids if p.ids.count(i) > 1})
    if dup: err(f'{page}: duplicate ids {dup}')
    for blob in p.ld:
        try: json.loads(blob)
        except Exception as e: err(f'{page}: JSON-LD does not parse ({e})')
    visible = ' '.join(p.text) + ' ' + ' '.join(p.ld)
    for pat, why in FORBIDDEN:
        m = re.search(pat, visible, re.I)
        if m: err(f'{page}: "{m.group(0)}" found ({why})')

if os.path.isfile('sitemap.xml'):
    for loc in re.findall(r'<loc>https://sakhilebhayi\.com(/[^<]*)</loc>', open('sitemap.xml', encoding='utf-8').read()):
        if not exists(loc): err(f'sitemap.xml: {loc} has no file')

if errors:
    print('SITE CHECK FAILED'); [print(' -', e) for e in errors]; sys.exit(1)
print(f'site check passed ({len(PAGES)} pages)')
