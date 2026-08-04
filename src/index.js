const BALE_BOT_TOKEN = "877619133:9LBldbNTxSFZ9jfwKSVtC-5Tb0CX3yNkJL4";
const BALE_CHAT_ID = "5040875422";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // اگر درخواست POST بود → یعنی سفارش جدید
    if (request.method === "POST") {
      // CORS
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      try {
        const data = await request.json();

        let message = `📦 *سفارش جدید*\n`;
        message += `────────────────\n`;
        message += `🛠 خدمت: ${data.service}\n`;
        message += `👤 نام: ${data.name}\n`;
        message += `📞 تماس: \`${data.phone}\`\n`;
        message += `📝 توضیحات: ${data.notes}\n`;
        message += `🌐 منبع: ${data.platform}\n`;

        if (data.userId) {
          message += `🆔 آیدی کاربر: \`${data.userId}\`\n`;
          if (data.username) message += `👤 یوزرنیم: @${data.username}\n`;
          if (data.fullName) message += `📛 نام در اپ: ${data.fullName}\n`;
        }

        message += `⏱ زمان: ${data.time}\n`;
        message += `────────────────\n`;

        if (data.platform === "بله" && data.userId) {
          message += `📤 برای ارسال نتیجه به کاربر بله:\nاز ربات بله به آیدی \`${data.userId}\` فایل بفرستید.`;
        } else if (data.platform === "تلگرام" && data.userId) {
          message += `📤 برای ارسال نتیجه به کاربر تلگرام:\nاز ربات تلگرام به آیدی \`${data.userId}\` فایل بفرستید.`;
        } else {
          message += `📤 با شماره \`${data.phone}\` تماس بگیرید.`;
        }

        const res = await fetch(`https://tapi.bale.ai/bot${BALE_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: BALE_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
          })
        });

        const result = await res.json();

        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, description: err.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    // اگر درخواست معمولی بود → فایل‌های استاتیک (HTML) رو نشون بده
    return env.ASSETS.fetch(request);
  }
};