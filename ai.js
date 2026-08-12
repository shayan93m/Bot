// ai.js - کدهای مربوط به دستیار هوشمند
const GEMINI_API_KEY = "AQ.Ab8RN6IDVJN_4JZmCYajqTXL5hcWpHFPMy3PflG6jhpk8Ne1jQ";

let chatHistory = [];
let SYSTEM_PROMPT = "";

function initSystemPrompt() {
  if (typeof services === 'undefined' || !services) return;
  const serviceTitles = services.map(s => `${s.id}. ${s.title}`).join('، ');
  SYSTEM_PROMPT = `شما یک دستیار هوشمند و بسیار مودب برای یک کافی‌نت هستید.
قوانین بسیار مهم که باید صراحتاً رعایت کنید:
۱. فقط و فقط به سوالات مرتبط با خدمات کافی‌نت، امور اینترنتی، سامانه‌های دولتی (ثنا، سخا، مای‌مدیو، املاک، بیمه، مالیات، سجام و...) و وام‌ها/ثبت‌نام‌ها پاسخ دهید.
۲. اگر کاربر سوالی نامربوط به حوزه کاری کافی‌نت پرسید، خیلی محترمانه پاسخ دهید: "عذرخواهی می‌کنم، من دستیار تخصصی خدمات کافی‌نت هستم و فقط می‌توانم در زمینه ثبت‌نام‌ها، سامانه‌ها و امور اینترنتی به شما پاسخ دهم."
۳. لیست کامل خدمات کافی‌نت ما به همراه آیدی شامل این موارد است: ${serviceTitles}.
۴. اگر کاربر درخواست انجام یکی از خدمات فوق را داشت، یا سوالش با یکی از خدمات مرتبط بود، او را تشویق کنید که سفارش دهد و در پاسخ خود حتما عبارت کلیدی [ORDER:کد_عنوان_خدمت] را قرار دهید تا سیستم دکمه فرم سفارش را برای او باز کند. مثلا اگر خواست ثبت نام ثنا انجام دهد بنویسید [ORDER:۱. ثبت نام ثنا].
۵. پاسخ‌ها را کوتاه، مفید و دقیق بدهید.`;
}

function openAiChat() {
  document.getElementById('aiModal').style.display = 'flex';
}

function handleKeyPress(e) {
  if (e.key === 'Enter') sendAiMessage();
}

async function sendAiMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const chatBox = document.getElementById('chatBox');
  const sendBtn = document.getElementById('aiSendBtn');

  chatBox.innerHTML += `<div class="chat-msg user">${text}</div>`;
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-msg ai';
  loadingDiv.innerText = 'در حال بررسی سوال...';
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  sendBtn.disabled = true;

  if (chatHistory.length === 0 && SYSTEM_PROMPT) {
    chatHistory.push({ role: "user", parts: [{ text: "دستورالعمل سیستم: " + SYSTEM_PROMPT }] });
    chatHistory.push({ role: "model", parts: [{ text: "متوجه شدم. من دستیار تخصصی کافی‌نت هستم." }] });
  }

  chatHistory.push({ role: "user", parts: [{ text: text }] });

  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: chatHistory
      })
    });

    if (response.ok) {
      const data = await response.json();
      let aiResponse = data.candidates[0].content.parts[0].text;
      
      chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });

      let orderBtnHtml = "";
      const orderMatch = aiResponse.match(/\[ORDER:(.*?)\]/);
      if (orderMatch) {
        const targetService = orderMatch[1];
        aiResponse = aiResponse.replace(/\[ORDER:.*?\]/g, "");
        orderBtnHtml = `<br><button class="inline-order-btn" onclick="openOrderModal('${targetService}')">📝 ثبت سفارش ${targetService}</button>`;
      }

      loadingDiv.innerHTML = aiResponse + orderBtnHtml;
    } else {
      const errData = await response.json();
      console.error("Gemini Error Details:", errData);
      loadingDiv.innerText = `خطا در دریافت پاسخ (${response.status}). لطفاً اتصال اینترنت/تحریم‌شکن را بررسی کنید.`;
    }
  } catch (err) {
    console.error("Network Error:", err);
    loadingDiv.innerText = "خطا در برقراری ارتباط با شبکه.";
  } finally {
    sendBtn.disabled = false;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
