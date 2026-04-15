// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let settingsOpen = false;
let bookmarkPanelOpen = false;
let commentsOpen = false;
let selectedBookmarkColor = '#8b5cf6';

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем сохраненные настройки
    loadReadingSettings();
    
    // Обновляем прогресс чтения
    updateProgress(24);
    
    // Инициализируем активные кнопки
    initActiveButtons();
    
    console.log('📖 Spectra Reader initialized');
});

// ========== УПРАВЛЕНИЕ ПАНЕЛЯМИ ==========
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    settingsOpen = !settingsOpen;
    
    if (settingsOpen) {
        panel.classList.add('open');
        closeBookmarkPanel();
        closeComments();
    } else {
        panel.classList.remove('open');
    }
}

function toggleBookmarkPanel() {
    const panel = document.getElementById('bookmarkPanel');
    bookmarkPanelOpen = !bookmarkPanelOpen;
    
    if (bookmarkPanelOpen) {
        panel.classList.add('open');
        closeSettings();
        closeComments();
    } else {
        panel.classList.remove('open');
    }
}

function openComments() {
    const panel = document.getElementById('commentsPanel');
    commentsOpen = true;
    panel.classList.add('open');
    closeSettings();
    closeBookmarkPanel();
}

function closeComments() {
    const panel = document.getElementById('commentsPanel');
    commentsOpen = false;
    panel.classList.remove('open');
}

function closeSettings() {
    const panel = document.getElementById('settingsPanel');
    settingsOpen = false;
    panel.classList.remove('open');
}

function closeBookmarkPanel() {
    const panel = document.getElementById('bookmarkPanel');
    bookmarkPanelOpen = false;
    panel.classList.remove('open');
}

// ========== НАСТРОЙКИ ЧТЕНИЯ ==========
function setFont(font) {
    document.body.setAttribute('data-font', font);
    saveSetting('reading_font', font);
    updateActiveButtons('font', font);
    showNotification(`Шрифт: ${getFontName(font)}`);
}

function getFontName(font) {
    const fonts = { inter: 'Inter', merriweather: 'Merriweather', arial: 'Arial' };
    return fonts[font] || font;
}

function setFontSize(size) {
    document.body.setAttribute('data-font-size', size);
    saveSetting('reading_font_size', size);
    updateActiveButtons('font-size', size);
    
    const sizes = { small: '16px', medium: '18px', large: '20px', xlarge: '22px' };
    showNotification(`Размер шрифта: ${sizes[size]}`);
}

function setLineHeight(height) {
    document.body.setAttribute('data-line-height', height);
    saveSetting('reading_line_height', height);
    updateActiveButtons('line-height', height);
    
    const heights = { small: '1.4', normal: '1.6', large: '1.8', xlarge: '2.0' };
    showNotification(`Высота строк: ${heights[height]}`);
}

function setParagraphSpacing(spacing) {
    document.body.setAttribute('data-paragraph-spacing', spacing);
    saveSetting('paragraph_spacing', spacing);
    updateActiveButtons('paragraph-spacing', spacing);
}

function setMargins(margin) {
    document.body.setAttribute('data-margins', margin);
    saveSetting('reading_margins', margin);
    updateActiveButtons('margins', margin);
    
    const margins = { narrow: 'Узкие', normal: 'Широкие' };
    showNotification(`Поля: ${margins[margin]}`);
}

function setTextAlign(align) {
    document.body.setAttribute('data-align', align);
    saveSetting('text_align', align);
    updateActiveButtons('align', align);
    
    const aligns = { left: 'По левому', justify: 'По ширине', right: 'По правому' };
    showNotification(`Выравнивание: ${aligns[align]}`);
}

function setHyphens(hyphens) {
    document.body.setAttribute('data-hyphens', hyphens);
    saveSetting('hyphens', hyphens);
    updateActiveButtons('hyphens', hyphens);
    
    showNotification(`Переносы: ${hyphens === 'auto' ? 'Включены' : 'Отключены'}`);
}

function setOrientation(orientation) {
    showNotification(`Режим: ${orientation === 'vertical' ? 'Вертикальный' : 'Горизонтальный'} (демо)`);
    updateActiveButtons('orientation', orientation);
}

function setBrightness(mode) {
    let value = 100;
    if (mode === 'low') value = 70;
    if (mode === 'high') value = 130;
    
    document.body.setAttribute('data-brightness', mode);
    document.body.style.filter = `brightness(${value}%)`;
    
    const slider = document.getElementById('brightnessSlider');
    const valueDisplay = document.getElementById('brightnessValue');
    
    if (slider) slider.value = value;
    if (valueDisplay) valueDisplay.textContent = value + '%';
    
    saveSetting('brightness_mode', mode);
    saveSetting('brightness_value', value);
    updateActiveButtons('brightness', mode);
}

function updateBrightness(value) {
    document.body.style.filter = `brightness(${value}%)`;
    document.getElementById('brightnessValue').textContent = value + '%';
    
    let mode = 'normal';
    if (value <= 70) mode = 'low';
    if (value >= 130) mode = 'high';
    
    document.body.setAttribute('data-brightness', mode);
    saveSetting('brightness_value', value);
    saveSetting('brightness_mode', mode);
    updateActiveButtons('brightness', mode);
}

function setReadingTheme(theme) {
    document.body.setAttribute('data-reading-theme', theme);
    saveSetting('reading_theme', theme);
    
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    const themeNames = {
        classic: 'Классика',
        sepia: 'Сепия',
        night: 'Ночь',
        forest: 'Лес',
        radiation: 'Радиационная точка'
    };
    
    showNotification(`Тема: ${themeNames[theme] || theme}`);
}

function resetReadingSettings() {
    setFont('inter');
    setFontSize('medium');
    setLineHeight('normal');
    setParagraphSpacing('normal');
    setMargins('normal');
    setTextAlign('justify');
    setHyphens('auto');
    setBrightness('normal');
    setReadingTheme('classic');
    
    showNotification('⚡ Настройки сброшены');
}

// ========== ЗАКЛАДКИ ==========
function openBookmarkModal() {
    document.getElementById('bookmarkModal').style.display = 'flex';
}

function closeBookmarkModal() {
    document.getElementById('bookmarkModal').style.display = 'none';
}

function selectBookmarkColor(color, element) {
    selectedBookmarkColor = color;
    
    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('active');
    });
    
    element.classList.add('active');
}

function saveBookmark() {
    const name = document.getElementById('bookmarkNameInput').value || 'Закладка';
    const page = document.getElementById('bookmarkPageInput').value || '1';
    
    const bookmarkList = document.getElementById('bookmarkList');
    const newBookmark = document.createElement('div');
    newBookmark.className = 'bookmark-item';
    newBookmark.innerHTML = `
        <div class="bookmark-title">${name}</div>
        <div class="bookmark-meta">
            <span><i class="fas fa-bookmark" style="color: ${selectedBookmarkColor};"></i> стр. ${page}</span>
            <span>${new Date().toLocaleDateString('ru-RU')}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.3rem;">
            Закладка создана
        </div>
    `;
    
    bookmarkList.prepend(newBookmark);
    
    closeBookmarkModal();
    showNotification('✅ Закладка создана');
}

function jumpToBookmark(id) {
    showNotification(`🔖 Переход к закладке ${id}`);
}

// ========== КОММЕНТАРИИ ==========
function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (!text) {
        showNotification('❌ Введите текст комментария', 'error');
        return;
    }
    
    const commentsList = document.getElementById('commentsList');
    const now = new Date();
    const timeString = now.getMinutes() + ' мин назад';
    
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <div class="comment-author">
            <span class="comment-avatar">В</span>
            <span style="font-weight: 600; font-size: 0.8rem;">Вы</span>
            <span style="font-size: 0.65rem; color: var(--text-tertiary);">только что</span>
        </div>
        <div class="comment-text">${text}</div>
    `;
    
    commentsList.prepend(newComment);
    
    const count = commentsList.children.length;
    document.getElementById('commentCount').textContent = count;
    document.getElementById('commentsHeaderCount').textContent = `(${count})`;
    
    input.value = '';
    showNotification('💬 Комментарий добавлен');
}

// ========== СВОЯ ТЕМА ==========
function openCustomThemeModal() {
    document.getElementById('customThemeModal').style.display = 'flex';
}

function closeCustomThemeModal() {
    document.getElementById('customThemeModal').style.display = 'none';
}

function applyCustomTheme() {
    const themeName = document.getElementById('themeNameInput').value || 'Своя тема';
    const bgColor = document.getElementById('themeBgColor').value;
    const textColor = document.getElementById('themeTextColor').value;
    const accentColor = document.getElementById('themeAccentColor').value;
    const gradient = document.getElementById('themeGradient').value;
    const useWidth = document.getElementById('themeWidth').checked;
    const useHeight = document.getElementById('themeHeight').checked;
    
    const styleId = 'custom-theme-style';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    
    let bgStyle = bgColor;
    if (gradient === 'radial') {
        bgStyle = `radial-gradient(circle at 30% 30%, ${bgColor}80, ${bgColor})`;
    } else if (gradient === 'linear') {
        bgStyle = `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`;
    }
    
    styleEl.textContent = `
        body[data-custom-theme="${themeName}"] {
            --bg: ${bgColor};
            --bg-gradient: ${bgStyle};
            --text-primary: ${textColor};
            --primary: ${accentColor};
            --surface-solid: ${bgColor}ee;
            --border: ${accentColor}80;
        }
    `;
    
    document.body.setAttribute('data-custom-theme', themeName);
    document.body.setAttribute('data-reading-theme', 'custom');
    
    closeCustomThemeModal();
    showNotification(`🎨 Тема "${themeName}" применена`);
}

// ========== ПРОГРЕСС ЧТЕНИЯ ==========
function updateProgress(percent) {
    const progressBar = document.getElementById('progressBar');
    const tooltip = document.getElementById('progressTooltip');
    
    progressBar.style.width = percent + '%';
    
    const pages = Math.round(percent * 2);
    tooltip.textContent = `${percent}% • стр. ${pages}/200`;
}

function jumpToPosition(event) {
    const container = document.getElementById('progressContainer');
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = Math.round((x / rect.width) * 100);
    
    updateProgress(Math.min(100, Math.max(0, percent)));
    showNotification(`📖 Переход на ${percent}% книги`);
}

// ========== УТИЛИТЫ ==========
function saveSetting(key, value) {
    localStorage.setItem('spectra_' + key, value);
}

function loadSetting(key, defaultValue) {
    return localStorage.getItem('spectra_' + key) || defaultValue;
}

function loadReadingSettings() {
    const font = loadSetting('reading_font', 'inter');
    const fontSize = loadSetting('reading_font_size', 'medium');
    const lineHeight = loadSetting('reading_line_height', 'normal');
    const paragraphSpacing = loadSetting('paragraph_spacing', 'normal');
    const margins = loadSetting('reading_margins', 'normal');
    const align = loadSetting('text_align', 'justify');
    const hyphens = loadSetting('hyphens', 'auto');
    const brightnessMode = loadSetting('brightness_mode', 'normal');
    const brightnessValue = loadSetting('brightness_value', 100);
    const theme = loadSetting('reading_theme', 'classic');
    
    setFont(font);
    setFontSize(fontSize);
    setLineHeight(lineHeight);
    setParagraphSpacing(paragraphSpacing);
    setMargins(margins);
    setTextAlign(align);
    setHyphens(hyphens);
    setReadingTheme(theme);
    
    document.body.style.filter = `brightness(${brightnessValue}%)`;
    const slider = document.getElementById('brightnessSlider');
    const valueDisplay = document.getElementById('brightnessValue');
    if (slider) slider.value = brightnessValue;
    if (valueDisplay) valueDisplay.textContent = brightnessValue + '%';
    
    initActiveButtons();
}

function initActiveButtons() {
    // Функция-заглушка для совместимости
}

function updateActiveButtons(group, value) {
    document.querySelectorAll(`.settings-option`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll(`.settings-option`).forEach(btn => {
        if (btn.textContent.includes(value) || 
            btn.getAttribute('onclick')?.includes(value) ||
            (group === 'font' && btn.getAttribute('onclick')?.includes(`setFont('${value}')`))) {
            btn.classList.add('active');
        }
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    const icon = notification.querySelector('i');
    
    messageEl.textContent = message;
    
    if (type === 'success') {
        icon.style.color = 'var(--success)';
        notification.style.borderLeftColor = 'var(--success)';
        icon.className = 'fas fa-check-circle';
    } else {
        icon.style.color = 'var(--danger)';
        notification.style.borderLeftColor = 'var(--danger)';
        icon.className = 'fas fa-exclamation-triangle';
    }
    
    notification.style.display = 'flex';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// ========== ЗАКРЫТИЕ ПО КЛИКУ ВНЕ ==========
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
    
    if (settingsOpen && !e.target.closest('.settings-panel') && !e.target.closest('[onclick="toggleSettings()"]')) {
        closeSettings();
    }
    
    if (bookmarkPanelOpen && !e.target.closest('.bookmark-panel') && !e.target.closest('[onclick="toggleBookmarkPanel()"]')) {
        closeBookmarkPanel();
    }
    
    if (commentsOpen && !e.target.closest('.comments-panel') && !e.target.closest('[onclick="openComments()"]')) {
        closeComments();
    }
});

// ========== ГОРЯЧИЕ КЛАВИШИ ==========
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSettings();
        closeBookmarkPanel();
        closeComments();
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleBookmarkPanel();
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleSettings();
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        openComments();
    }
});

// ========== PWA СЕРВИС ВОРКЕР ==========
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed:', err);
        });
    });
}