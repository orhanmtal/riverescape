import os

path = 'www/index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

ga_code = """
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SBYN3068JJ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-SBYN3068JJ');
</script>
"""

if 'G-SBYN3068JJ' not in content:
    content = content.replace('<head>', '<head>' + ga_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Google Analytics (G-SBYN3068JJ) injected successfully.")
