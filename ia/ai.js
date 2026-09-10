// ia/ai.js

import { PROXY_URL, services, lockBodyScroll, openOrderModal, openServiceModal, closeAllModals, CONTACT_URL } from '../index.js';

let chatHistory = [];
let conversationDates = [];
let SYSTEM_PROMPT = "";
let historyRestored = false;
let lastShownDate = null;

const STORAGE_KEY = 'kafinet_ai_chat_v1';
const STORAGE_MAX_MESSAGES = 200;
const STORAGE_EXPIRY_MS = 8 * 24 * 60 * 60 * 1000; // ۸ روز

export function openAiChat() {
  const modal = document.getElementById('aiModal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  lockBodyScroll();
  initSystemPrompt();
  setupEvents();

  if (!historyRestored) {
    restoreChatHistory();
    historyRestored = true;
  }
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
  const serviceLines = services.map(s => {
    const parts = [`${s.id}. ${s.title}`];
    if (s.decs) parts.push(`توضیحات: ${s.decs}`);
    if (s.docs) parts.push(`مدارک لازم: ${s.docs}`);
    if (s.time) parts.push(`مدت انجام: ${s.time}`);
    if (s.cost) parts.push(`قیمت: ${s.cost} تومان`);
    return parts.join(' | ');
  }).join('\n');

  SYSTEM_PROMPT = `شما دستیار هوشمند و صمیمی یک کافی‌نت هستید. با کاربر مثل یک همکار مهربان و خودمونی صحبت کنید، نه رسمی و خشک، ولی حرفه‌ای و دقیق بمانید.

لیست کامل خدمات کافی‌نت (هر خط یک خدمت، با جزئیاتش):
${serviceLines}

قوانین بسیار مهم که باید صراحتاً و بدون استثنا رعایت کنید:

۱. فقط و فقط به سوالات مرتبط با خدمات بالا، امور اینترنتی، سامانه‌های دولتی (ثنا، سخا، مای‌مدیو، املاک، بیمه، مالیات، سجام و...)، وام‌ها/ثبت‌نام‌ها پاسخ دهید. اگر سوال کاملاً نامربوط بود، محترمانه بگویید که فقط در زمینه‌ی خدمات کافی‌نت می‌توانید کمک کنید.

۲. وقتی کاربر درباره‌ی یک خدمت سوال می‌پرسد (چیه، چطوریه، چی لازم داره و...)، از اطلاعات همان خدمت (توضیحات، مدارک لازم، مدت انجام) استفاده کن و یک توضیح کامل و روان بده. مثال خوب: «دریافت ابلاغیه حدود ۱۰ دقیقه زمان می‌بره؛ کد ملی و رمز ثنای متقاضی لازمه، و باید گوشی‌ای که کد تاییدش میاد دم دست باشه.» فقط مدارک را کوتاه و خشک لیست نکن، در قالب یک توضیح طبیعی بگو.

۳. اگر کاربر فقط درباره‌ی مدارک لازم یک خدمت پرسید، دقیقاً همان چیزی که در ستون «مدارک لازم» آن خدمت نوشته شده را بگو.

۴. قیمت را هرگز خودت پیش‌قدم نشو و نگو، مگر اینکه کاربر صراحتاً و مستقیم درباره‌ی قیمت یا هزینه پرسیده باشد (مثلاً «چقدر می‌شه»، «هزینه‌اش چقدره»). آن‌وقت دقیقاً همان مبلغی که کنار آن خدمت نوشته شده را بگو و حتماً این نکته را هم اضافه کن: «این هزینه پس از تایید وصل بودن سامانه‌ی مربوطه از شما دریافت می‌شود» (یعنی اگر سامانه‌ی دولتی قطع/در دسترس نبود، هزینه‌ای گرفته نمی‌شود). اگر برای خدمتی قیمتی ثبت نشده بود، بگو برای اعلام قیمت دقیق باید سفارش ثبت شود.

۵. اگر درخواست کاربر دقیقاً با یکی از خدمات بالا یکی نبود ولی مرتبط و نزدیک بود، در لیست خدمات بگرد و نزدیک‌ترین و مرتبط‌ترین خدمت را پیدا کن و همان را با توضیح پیشنهاد بده (به‌جای اینکه بگویی چنین خدمتی نداریم).

۶. اگر کاربر درخواست انجام یکی از خدمات را داشت یا سوالش با یکی از خدمات مرتبط بود، در پاسخ خود حتما عبارت کلیدی [ORDER:کد_عنوان_خدمت] را دقیقاً همان‌طور که در لیست بالا نوشته شده (فقط شماره و عنوان، با ارقام انگلیسی، بدون بقیه‌ی جزئیات) قرار بده تا سیستم دکمه‌ی مشاهده‌ی جزئیات همان خدمت را برای او باز کند. مثال: [ORDER:1. ثبت نام ثنا].

۷. شما هرگز نمی‌توانید سفارش کاربر را واقعاً ثبت یا تایید کنید و هرگز نباید ادعا کنید که «سفارش شما ثبت شد». ثبت واقعی سفارش فقط از طریق فرمی انجام می‌شود که با کلیک روی دکمه‌ی [ORDER:...] باز می‌شود. بنابراین:
   - هرگز از کاربر نام، شماره تماس، کد ملی یا هر اطلاعات شخصی دیگری را داخل چت نپرس.
   - هرگز از کاربر نخواه که برای «تایید» یا «ادامه» فقط کلمه‌ای مثل «بله» بنویسد تا سفارشش را ثبت کنی.
   - فقط کافیه خدمت مناسب را معرفی کنی و دکمه‌ی [ORDER:...] را نمایش بدهی؛ خود کاربر با کلیک روی دکمه فرم را پر می‌کند.

۸. ساعت کاری کافی‌نت ۹ صبح تا ۹ شب است، و سفارش‌های خارج از این بازه در اولین روز کاری بعدی رسیدگی می‌شوند. این موضوع را فقط زمانی بگو که کاربر مستقیماً درباره‌ی ساعت کاری یا زمان رسیدگی پرسیده باشد؛ در غیر این صورت خودت پیش‌قدم به گفتنش نشو.

۹. اگر با وجود تلاش، واقعاً نتوانستی به سوال کاربر پاسخ درستی بدهی (چه به‌خاطر خارج از تخصص بودن، چه به‌خاطر ندانستن جواب دقیق)، در انتهای پاسخ خود حتما عبارت [CONTACT] را اضافه کن تا سیستم لینک صفحه‌ی «ارتباط با ما» را برای کاربر نمایش دهد.

۱۰. پاسخ‌ها را کوتاه، گرم، طبیعی و دقیق بده؛ از تکرار غیرضروری و لحن رباتیک خودداری کن.

۱۱. اگر کاربر پرسید اسمت چیه یا خودت رو معرفی کن، بگو: «من رو کافی‌نت شایان طراحی کرده؛ می‌تونی من رو شایان صدا کنی.»`;
}

// جدا کردن تگ‌های [ORDER:...] و [CONTACT] از متن و ساخت دکمه‌های مربوطه
function processAiText(rawText) {
  let text = rawText;
  let btnHtml = "";

  const orderMatch = text.match(/\[ORDER:(.*?)\]/);
  if (orderMatch) {
    const targetService = orderMatch[1];
    text = text.replace(/\[ORDER:.*?\]/g, "");
    btnHtml += `<br><button class="inline-order-btn" data-target="${targetService}">📋 مشاهده جزئیات ${targetService}</button>`;
  }

  if (text.includes('[CONTACT]')) {
    text = text.replace(/\[CONTACT\]/g, "");
    btnHtml += `<br><a class="inline-order-btn" href="${CONTACT_URL}" target="_blank" rel="noopener">📞 ارتباط با ما</a>`;
  }

  return { text, btnHtml };
}

// نمایش یک جداکننده‌ی تاریخ (فقط روز/ماه، بدون ساعت) اگر تاریخ نسبت به پیام قبلی عوض شده باشد
function maybeRenderDateSeparator(chatBox, dateStr) {
  if (!dateStr || dateStr === lastShownDate) return;
  lastShownDate = dateStr;
  chatBox.insertAdjacentHTML('beforeend', `<div class="chat-msg-date" style="text-align:center;font-size:12px;color:#888;margin:8px 0 4px;">${dateStr}</div>`);
}

// وصل کردن رویداد کلیک به دکمه‌ی مشاهده جزئیات خدمت، داخل یک container مشخص
function attachOrderBtnListener(container) {
  const orderBtn = container.querySelector('.inline-order-btn[data-target]');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
      const target = orderBtn.dataset.target.replace(/[۰-۹]/g, d => persianDigits.indexOf(d));
      const idMatch = target.match(/^\d+/);
      closeAllModals();
      openServiceModal(idMatch ? idMatch[0] : target);
    });
  }
}

// ذخیره‌ی مکالمه (بدون دستورالعمل سیستم) در localStorage مرورگر کاربر
function saveChatHistory() {
  try {
    const systemPairCount = (chatHistory[0]?.parts?.[0]?.text || '').startsWith('دستورالعمل سیستم:') ? 2 : 0;
    const conversation = chatHistory.slice(systemPairCount).slice(-STORAGE_MAX_MESSAGES);
    const dates = conversationDates.slice(-STORAGE_MAX_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), messages: conversation, dates }));
  } catch (e) {
    console.warn('ذخیره‌ی تاریخچه چت ممکن نشد:', e);
  }
}

// بازیابی مکالمه‌ی قبلی از localStorage و رندر کردنش داخل چت‌باکس
function restoreChatHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.messages) || parsed.messages.length === 0) return;
    if (Date.now() - (parsed.savedAt || 0) > STORAGE_EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    const fallbackDate = new Date(parsed.savedAt || Date.now()).toLocaleDateString('fa-IR');
    const dates = Array.isArray(parsed.dates) && parsed.dates.length === parsed.messages.length
      ? parsed.dates
      : parsed.messages.map(() => fallbackDate);

    parsed.messages.forEach((msg, i) => {
      const rawText = msg?.parts?.[0]?.text || '';
      if (!rawText) return;
      const dateStr = dates[i];
      maybeRenderDateSeparator(chatBox, dateStr);
      if (msg.role === 'user') {
        chatBox.insertAdjacentHTML('beforeend', `<div class="chat-msg user">${rawText}</div>`);
      } else {
        const { text, btnHtml } = processAiText(rawText);
        const div = document.createElement('div');
        div.className = 'chat-msg ai';
        div.innerHTML = text + btnHtml;
        chatBox.appendChild(div);
        attachOrderBtnListener(div);
      }
    });

    if (chatHistory.length === 0 && SYSTEM_PROMPT) {
      chatHistory.push({ role: "user", parts: [{ text: "دستورالعمل سیستم: " + SYSTEM_PROMPT }] });
      chatHistory.push({ role: "model", parts: [{ text: "متوجه شدم. من دستیار تخصصی کافی‌نت هستم." }] });
    }
    chatHistory.push(...parsed.messages);
    conversationDates.push(...dates);

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (e) {
    console.warn('بازیابی تاریخچه چت ممکن نشد:', e);
  }
}

export async function sendAiMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const chatBox = document.getElementById('chatBox');
  const sendBtn = document.getElementById('aiSendBtn');

  const todayStr = new Date().toLocaleDateString('fa-IR');
  maybeRenderDateSeparator(chatBox, todayStr);
  chatBox.insertAdjacentHTML('beforeend', `<div class="chat-msg user">${text}</div>`);
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-msg ai';
  loadingDiv.innerText = 'یه لحظه صبر کن...';
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  sendBtn.disabled = true;

  if (chatHistory.length === 0 && SYSTEM_PROMPT) {
    chatHistory.push({ role: "user", parts: [{ text: "دستورالعمل سیستم: " + SYSTEM_PROMPT }] });
    chatHistory.push({ role: "model", parts: [{ text: "متوجه شدم. من دستیار تخصصی کافی‌نت هستم." }] });
  }
  chatHistory.push({ role: "user", parts: [{ text: text }] });
  conversationDates.push(todayStr);

  try {
    const response = await fetch(`${PROXY_URL}/ia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    if (response.ok) {
      const data = await response.json();
      let aiResponse = data.candidates[0].content.parts[0].text;
     
      chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
      conversationDates.push(new Date().toLocaleDateString('fa-IR'));
      const { text: cleanText, btnHtml } = processAiText(aiResponse);
      loadingDiv.innerHTML = cleanText + btnHtml;
      attachOrderBtnListener(loadingDiv);
    } else {
      loadingDiv.innerText = `خطا در دریافت پاسخ (${response.status}). لطفاً اتصال اینترنت خود را بررسی کنید.`;
    }
  } catch (err) {
    console.error("Network Error:", err);
    loadingDiv.innerText = "خطا در برقراری ارتباط با شبکه.";
  } finally {
    sendBtn.disabled = false;
    chatBox.scrollTop = chatBox.scrollHeight;
    saveChatHistory();
  }
}
