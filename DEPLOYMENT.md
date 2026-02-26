# 🚀 دليل النشر - WormGPT Pro

هذا الدليل يشرح كيفية نشر المشروع على منصات مختلفة.

## 📋 المحتويات
1. [النشر على GitHub Pages](#github-pages)
2. [النشر على Netlify](#netlify)
3. [النشر على Vercel](#vercel)
4. [النشر على سيرفر خاص](#custom-server)

---

## 🌐 النشر على GitHub Pages

### الطريقة الأولى: من خلال الإعدادات

#### 1. رفع المشروع إلى GitHub

```bash
# إنشاء repository جديد على GitHub
# ثم نفذ الأوامر التالية:

git init
git add .
git commit -m "Initial commit: WormGPT Pro"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wormgpt-pro.git
git push -u origin main
```

#### 2. تفعيل GitHub Pages

1. اذهب إلى **Settings** في repository
2. اضغط على **Pages** من القائمة الجانبية
3. في **Source**، اختر **main** branch
4. اختر **/ (root)** كمجلد
5. اضغط **Save**

✅ سيكون الموقع متاح على:
```
https://YOUR_USERNAME.github.io/wormgpt-pro/
```

### الطريقة الثانية: باستخدام GitHub Actions

#### 1. أنشئ ملف `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

#### 2. ادفع التغييرات

```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push
```

✅ سيتم النشر تلقائياً عند كل push!

---

## 🎯 النشر على Netlify

### الطريقة الأولى: من خلال واجهة Netlify

1. اذهب إلى [netlify.com](https://netlify.com)
2. اضغط **"Add new site"** > **"Import an existing project"**
3. اختر GitHub واربط حسابك
4. اختر repository **wormgpt-pro**
5. اترك الإعدادات الافتراضية:
   - Build command: (فارغ)
   - Publish directory: (فارغ أو `/`)
6. اضغط **Deploy site**

✅ سيكون الموقع متاح على:
```
https://random-name-123456.netlify.app
```

### الطريقة الثانية: باستخدام Netlify CLI

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
cd wormgpt-pro
netlify init
netlify deploy --prod
```

### إعدادات إضافية لـ Netlify

أنشئ ملف `netlify.toml`:

```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## ⚡ النشر على Vercel

### الطريقة الأولى: من خلال واجهة Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **"New Project"**
3. استورد repository من GitHub
4. اترك الإعدادات الافتراضية
5. اضغط **Deploy**

✅ سيكون الموقع متاح خلال دقائق!

### الطريقة الثانية: باستخدام Vercel CLI

```bash
# تثبيت Vercel CLI
npm install -g vercel

# النشر
cd wormgpt-pro
vercel --prod
```

### إعدادات إضافية لـ Vercel

أنشئ ملف `vercel.json`:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🖥️ النشر على سيرفر خاص

### 1. باستخدام Apache

```bash
# رفع الملفات إلى السيرفر
scp -r * user@your-server.com:/var/www/html/wormgpt-pro/

# أو باستخدام FTP/SFTP
```

إعدادات `.htaccess`:

```apache
# تفعيل الضغط
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# تفعيل التخزين المؤقت
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>

# إعادة التوجيه إلى HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 2. باستخدام Nginx

إعدادات Nginx `/etc/nginx/sites-available/wormgpt-pro`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/wormgpt-pro;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # تفعيل الضغط
    gzip on;
    gzip_types text/css text/javascript application/javascript;
    
    # التخزين المؤقت
    location ~* \.(css|js|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

ثم:
```bash
sudo ln -s /etc/nginx/sites-available/wormgpt-pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. باستخدام Docker

أنشئ `Dockerfile`:

```dockerfile
FROM nginx:alpine

# نسخ الملفات
COPY . /usr/share/nginx/html

# إعدادات Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

أنشئ `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

بناء وتشغيل:

```bash
# بناء الصورة
docker build -t wormgpt-pro .

# تشغيل الحاوية
docker run -d -p 80:80 wormgpt-pro
```

---

## 🔐 الأمان والإعدادات الهامة

### 1. تأمين مفتاح API

**⚠️ هام جداً:** لا تضع مفتاح API في الكود!

إنشاء ملف `config.example.js`:

```javascript
// config.example.js
const CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE',
    API_URL: 'https://sii3.top/api/error/wormgpt.php'
};
```

أضف `config.js` إلى `.gitignore`:
```
config.js
```

### 2. إعدادات CORS

إذا واجهت مشاكل CORS، تحتاج لإعداد السيرفر:

**Apache** (`.htaccess`):
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
```

**Nginx**:
```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
```

### 3. تفعيل HTTPS

**باستخدام Let's Encrypt (مجاني):**

```bash
# تثبيت Certbot
sudo apt-get install certbot python3-certbot-nginx

# الحصول على شهادة
sudo certbot --nginx -d yourdomain.com

# تجديد تلقائي
sudo certbot renew --dry-run
```

---

## 🧪 الاختبار قبل النشر

### قائمة التحقق:

- [ ] جميع الملفات موجودة (HTML, CSS, JS)
- [ ] المكتبات الخارجية تعمل (Font Awesome, Prism.js)
- [ ] مفتاح API محمي وليس في الكود
- [ ] الموقع يعمل على متصفحات مختلفة
- [ ] الموقع متجاوب على الموبايل
- [ ] لا توجد أخطاء في Console
- [ ] جميع الروابط تعمل
- [ ] الصور والأيقونات تظهر

### أوامر اختبار محلية:

```bash
# باستخدام Python
python -m http.server 8000

# أو باستخدام Node.js
npx http-server -p 8000

# ثم افتح المتصفح على:
# http://localhost:8000
```

---

## 📊 المراقبة والتحليلات

### إضافة Google Analytics

في `index.html` قبل `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🆘 حل المشاكل الشائعة

### المشكلة: الموقع لا يظهر على GitHub Pages
**الحل:**
- تأكد من اختيار الفرع الصحيح (main)
- تأكد من وجود `index.html` في الجذر
- انتظر 5-10 دقائق للنشر

### المشكلة: الأيقونات لا تظهر
**الحل:**
- تحقق من اتصال الإنترنت
- تأكد من رابط Font Awesome صحيح
- تحقق من Console للأخطاء

### المشكلة: API لا يعمل
**الحل:**
- تأكد من صحة مفتاح API
- تحقق من إعدادات CORS
- راجع شبكة المتصفح (Network tab)

---

## 🎉 تهانينا!

الآن موقعك منشور وجاهز للاستخدام! 

### الخطوات التالية:

1. شارك الرابط مع الآخرين
2. راقب الأداء والأخطاء
3. استمع لملاحظات المستخدمين
4. حدّث المشروع بانتظام

---

**إذا واجهت أي مشكلة، لا تتردد في فتح Issue على GitHub!**

📧 **دعم إضافي:** راجع [CONTRIBUTING.md](CONTRIBUTING.md) للمساعدة
