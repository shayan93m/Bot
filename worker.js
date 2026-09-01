// =========================================================
// Cloudflare Worker: سفارش‌ها به بله + دستیار هوشمند سایت
// =========================================================
// این فایل رو در Worker خودت (bot-v2.youcoweb.workers.dev) جایگزین کد فعلی کن.
//
// این چهار مقدار باید به‌صورت Secret در تنظیمات Worker اضافه بشن
// (Settings -> Variables and Secrets -> Add):
//   BALE_BOT_TOKEN       توکن رباتی که از @botfather در بله گرفتی
//   BALE_GROUP_CHAT_ID   شناسه عددی گروه بله
//   DEEPSEEK_API_KEY     کلید API دیپ‌سیک

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'فقط درخواست‌های POST پذیرفته می‌شوند' }, 405);
    }

    const url = new URL(request.url);
    const pathname = url.pathname || '/';

    console.log('📨 درخواست دریافت شد:', {
      pathname,
      method: request.method,
      contentType: request.headers.get('content-type'),
    });

    // مسیر دستیار هوشمند
    if (pathname === '/gemini' || pathname === '/gemini/') {
      return handleGeminiProxy(request, env);
    }

    // مسیر اصلی: ثبت سفارش
    if (pathname === '/' || pathname === '') {
      return handleOrderToBale(request, env);
    }

    // مسیر نامشخص
    return jsonResponse({ ok: false, error: 'مسیر یافت نشد' }, 404);
  },
};

// =========================================================
// بخش ۱: ثبت سفارش و ارسال فایل به بله
// =========================================================
async function handleOrderToBale(request, env) {
  const BOT_TOKEN = env.BALE_BOT_TOKEN;
  const CHAT_ID = env.BALE_GROUP_CHAT_ID;

  console.log('🔍 بررسی متغیرهای محیطی:', {
    hasToken: !!BOT_TOKEN,
    hasChatId: !!CHAT_ID,
  });

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ متغیرهای محیطی تنظیم نشده‌اند');
    return jsonResponse({ 
      ok: false, 
      error: 'BALE_BOT_TOKEN یا BALE_GROUP_CHAT_ID تنظیم نشده است.' 
    }, 500);
  }

  const BALE_API = `https://tapi.bale.ai/bot${BOT_TOKEN}`;
  const contentType = request.headers.get('content-type') || '';

  try {
    // درخواست‌های JSON (پیام‌های متنی)
    if (contentType.includes('application/json')) {
      console.log('📝 درخواست JSON دریافت شد');
      const body = await request.json();

      if (body.type === 'text' && body.text) {
        console.log('✉️ ارسال پیام متنی به بله...');
        const res = await fetch(`${BALE_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: body.text,
            parse_mode: 'Markdown',
          }),
        });
        
        const data = await res.json();
        console.log('✅ پاسخ بله:', res.status, data);
        return jsonResponse(data, res.ok ? 200 : 502);
      }

      return jsonResponse({ ok: false, error: 'درخواست نامعتبر: فیلد type یا text مفقود' }, 400);
    }

    // درخواست‌های multipart (فایل‌ها)
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 درخواست multipart/form-data دریافت شد');
      const incomingForm = await request.formData();
      const type = incomingForm.get('type');

      if (type === 'file') {
        const file = incomingForm.get('document');
        const caption = incomingForm.get('caption') || '';

        console.log('🔍 اطلاعات فایل:', {
          hasFile: !!file,
          fileName: file?.name,
          fileSize: file?.size,
          fileType: file?.type,
          caption,
        });

        if (!file || typeof file === 'string') {
          console.error('❌ فایل دریافت نشد یا نامعتبر است');
          return jsonResponse({ ok: false, error: 'فایلی ارسال نشده است.' }, 400);
        }

        console.log('📤 ارسال فایل به بله...');
        const baleForm = new FormData();
        baleForm.append('chat_id', CHAT_ID);
        baleForm.append('caption', caption);
        baleForm.append('document', file, file.name);

        const res = await fetch(`${BALE_API}/sendDocument`, {
          method: 'POST',
          body: baleForm,
        });

        const data = await res.json();
        console.log('✅ پاسخ بله برای فایل:', res.status, data);
        return jsonResponse(data, res.ok ? 200 : 502);
      }

      return jsonResponse({ ok: false, error: 'درخواست نامعتبر' }, 400);
    }

    return jsonResponse({ 
      ok: false, 
      error: `Content-Type پشتیبانی نمی‌شود: ${contentType}` 
    }, 415);

  } catch (err) {
    console.error('💥 خطا در handleOrderToBale:', err);
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

// =========================================================
// بخش ۲: پروکسی DeepSeek برای دستیار هوشمند
// =========================================================
async function handleGeminiProxy(request, env) {
  const API_KEY = env.DEEPSEEK_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ DEEPSEEK_API_KEY تنظیم نشده است');
    return jsonResponse({ ok: false, error: 'DEEPSEEK_API_KEY تنظیم نشده است.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    console.error('❌ بدنه درخواست نامعتبر:', err);
    return jsonResponse({ ok: false, error: 'بدنه درخواست نامعتبر است.' }, 400);
  }

  if (!body.contents || !Array.isArray(body.contents)) {
    console.error('❌ فیلد contents یافت نشد');
    return jsonResponse({ ok: false, error: 'فیلد contents ارسال نشده است.' }, 400);
  }

  // تبدیل فرمت جمینای به OpenAI/DeepSeek
  const messages = body.contents.map(c => ({
    role: c.role === 'model' ? 'assistant' : 'user',
    content: (c.parts || []).map(p => p.text || '').join('\n'),
  }));

  try {
    console.log('🤖 ارسال درخواست به DeepSeek...');
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.3,
      }),
    });

    const dsData = await dsRes.json();

    if (!dsRes.ok) {
      console.error('❌ پاسخ DeepSeek خطا دارد:', dsData);
      return jsonResponse({ ok: false, error: dsData }, 502);
    }

    const replyText = dsData?.choices?.[0]?.message?.content || '';
    console.log('✅ پاسخ DeepSeek دریافت شد');

    const geminiShapedResponse = {
      candidates: [
        { content: { parts: [{ text: replyText }] } },
      ],
    };

    return jsonResponse(geminiShapedResponse, 200);

  } catch (err) {
    console.error('💥 خطا در handleGeminiProxy:', err);
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
