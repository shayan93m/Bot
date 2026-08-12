// index.js

// ۱. بارگذاری اولیه خدمات
document.addEventListener('DOMContentLoaded', () => {
    loadServices();
    setupAIButton();
});

async function loadServices() {
    try {
        const res = await fetch('services.json');
        const services = await res.json();
        // منطق رندر کردن کارت‌های خدمات روی صفحه
    } catch (err) {
        console.error("Error loading services:", err);
    }
}

// ۲. لود هوشمند (Lazy Load) ماژول AI فقط هنگام نیاز کاربر
function setupAIButton() {
    const aiBtn = document.getElementById('ai-toggle-btn');
    if (!aiBtn) return;

    aiBtn.addEventListener('click', async () => {
        // کد ai.js فقط در این لحظه از سرور دانلود می‌شود
        const aiModule = await import('./ai/ai.js');
        aiModule.initAIChat();
    });
}
