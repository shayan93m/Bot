// دامنه‌ای که اجازه دارد به این Worker درخواست بزند (سایت خودتان)
const ALLOWED_ORIGIN = 'https://shayan93m.github.io';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response('Only POST', { status: 405 });
    }

    // ── مسیر جدید: پراکسی امن برای Gemini ──
    // کلید API اینجا فقط از env خوانده می‌شود، نه از کد یا کلاینت
    if (url.pathname === '/gemini') {
      try {
        const body = await request.json();
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
        const data = await geminiRes.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }
    }

    // ── مسیر قبلی: ارسال سفارش/فایل به بله ──
    // توکن بله هم از env خوانده می‌شود (Secret)، نه هاردکد
    const BALE_TOKEN = env.BALE_BOT_TOKEN;
    const CHAT_ID = env.BALE_CHAT_ID;

    try {
      const contentType = request.headers.get('content-type') || '';

      // ارسال فایل
      if (contentType.includes('multipart/form-data')) {
        const form = await request.formData();
        const file = form.get('document');
        const caption = form.get('caption') || '';

        const baleForm = new FormData();
        baleForm.append('chat_id', CHAT_ID);
        baleForm.append('document', file);
        if (caption) baleForm.append('caption', caption);

        const res = await fetch(`https://tapi.bale.ai/bot${BALE_TOKEN}/sendDocument`, {
          method: 'POST',
          body: baleForm,
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // ارسال پیام متنی
      const body = await request.json();
      const res = await fetch(`https://tapi.bale.ai/bot${BALE_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: body.text,
          parse_mode: 'Markdown',
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }
  },
};
