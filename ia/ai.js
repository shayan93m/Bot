// ia/ai.js

import { PROXY_URL, services, lockBodyScroll, openOrderModal } from '../index.js';

let chatHistory = [];
let SYSTEM_PROMPT = "";

export function openAiChat() {
  const modal = document.getElementById('aiModal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  lockBodyScroll();
  initSystemPrompt();
  setupEvents();
}

function setupEvents() {
  const chatInput = document.getElementById('chatInput');
  const aiSendBtn = document.getElementById('aiSendBtn');

  if (chatInput && !chatInput.dataset.hasListener) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendAiMessage();
    });
    chatInput.dataset.hasListener = "true";
  }

  if (aiSendBtn && !aiSendBtn.dataset.hasListener) {
    aiSendBtn.addEventListener('click', sendAiMessage);
    aiSendBtn.dataset.hasListener = "true";
  }
}

function initSystemPrompt() {
  const serviceTitles = services.map(s => `${s.id}. ${s.title}`).join('، ');
  SYSTEM_PROMPT = `شما یک دستیار هوشمند و بسیار مودب برای یک کافی‌نت هستید.
قوانین بسیار مهم که باید صراحتاً رعایت کنید:
۱. فقط و فقط به سوالات مرتبط با خدمات کافی‌نت، امور اینترنتی، سامانه‌های دولتی (ثنا، سخا، مای‌مدیو، املاک، بیمه، مالیات، سجام و...) و وام‌ها/ثبت‌نام‌ها پاسخ دهید.
۲. اگر کاربر سوالی نامربوط به حوزه کاری کافی‌نت پرسید، خیلی محترمانه پاسخ دهید: "عذرخواهی می‌کنم، من دستیار تخصصی خدمات کافی‌نت هستم و فقط می‌توانم در زمینه ثبت‌نام‌ها، سامانه‌ها و امور اینترنتی به شما پاسخ دهم."
۳. لیست کامل خدمات کافی‌نت ما به همراه آیدی شامل این موارد است: ${serviceTitles}.
۴. اگر کاربر درخواست انجام یکی از خدمات فوق را داشت، یا سوالش با یکی از خدمات مرتبط بود، او را تشویق کنید که سفارش دهد و در پاسخ خود حتما عبارت کلیدی [ORDER:کد_عنوان_خدمت] را قرار دهید تا سیستم دکمه فرم سفارش را برای او باز کند. مثلا اگر خواست ثبت نام ثنا انجام دهد بنویسید [ORDER:۱. ثبت نام ثنا].
۵. پاسخ‌ها را کوتاه، مفید و دقیق بدهید.`;
}

export async function sendAiMessage() {
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

  try {
    const response = await fetch(`${PROXY_URL}/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
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
        orderBtnHtml = `<br><button class="inline-order-btn" data-target="${targetService}">📝 ثبت سفارش ${targetService}</button>`;
      }
      loadingDiv.innerHTML = aiResponse + orderBtnHtml;

      const orderBtn = loadingDiv.querySelector('.inline-order-btn');
      if (orderBtn) {
        orderBtn.addEventListener('click', () => openOrderModal(orderBtn.dataset.target));
      }
    } else {
      loadingDiv.innerText = `خطا در دریافت پاسخ (${response.status}). لطفاً اتصال اینترنت خود را بررسی کنید.`;
    }
  } catch (err) {
    console.error("Network Error:", err);
    loadingDiv.innerText = "خطا در برقراری ارتباط با شبکه.";
  } finally {
    sendBtn.disabled = false;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
