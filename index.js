export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Only POST', { status: 405 });
    }

    const BALE_TOKEN = '877619133:9LBldbNTxSFZ9jfwKSVtC-5Tb0CX3yNkJL4';
    const CHAT_ID = '5040875422';

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
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
