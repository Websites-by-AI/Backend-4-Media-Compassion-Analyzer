# راهنمای استقرار

این راهنما نحوه استقرار برنامه را توضیح می‌دهد.

## بخش ۱: فرانت‌اند (Cloudflare Pages)

۱. **اتصال مخزن**:
   - کد را به یک مخزن گیت‌هاب ارسال کنید.
   - در پنل کلودفلر، یک پروژه Pages جدید ایجاد کنید و به گیت‌هاب متصل شوید.

۲. **تنظیمات ساخت**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

## بخش ۲: بک‌اند (Cloudflare Workers)

بخش فرانت‌اند درخواست‌ها را به مسیر `/api/analyze` ارسال می‌کند. شما باید یک Worker برای مدیریت این مسیر تنظیم کنید.

### نمونه کد پیشنهادی (فریم‌ورک Hono)

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/api/*', cors())

app.post('/api/analyze', async (c) => {
  const { url } = await c.req.json()
  
  // ۱. استخراج شناسه ویدیو
  // ۲. دریافت متن ویدیو
  // ۳. تحلیل با هوش مصنوعی کلودفلر (@cf/meta/llama-3.1-8b-instruct)
  
  return c.json({
    transcript: "...",
    analysis: {
      compassionLevel: "بسیار بالا",
      tone: "همدلانه",
      bias: "خنثی",
      summary: "...",
      keyClaims: ["..."]
    }
  })
})

export default app
```

## بخش ۳: تنظیمات نهایی

فرانت‌اند هیچ کلید API مستقیمی نیاز ندارد و تمام ارتباطات از طریق بک‌اند انجام می‌شود.
