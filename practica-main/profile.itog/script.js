// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
const STORAGE_KEYS = {
    USERNAME: 'spectra_username',
    ABOUT: 'spectra_about',
    AVATAR_BORDER: 'avatar_border_color',
    REMINDER_TEXT: 'reminder_text',
    REMINDER_INTERVAL: 'reminder_interval',
    THEME: 'theme',
    BLUE_FILTER: 'blue_filter_enabled',
    BLUE_INTENSITY: 'blue_filter_intensity'
};

const DEFAULTS = {
    USERNAME: 'Книжный странник',
    ABOUT: 'Люблю читать фантастику и детективы. В свободное время пишу рецензии и обсуждаю книги в клубе любителей чтения. Мечтаю собрать библиотеку из 1000 книг 📚',
    AVATAR_BORDER: '#6366f1',
    REMINDER_TEXT: 'Сделайте небольшой перерыв от чтения.',
    REMINDER_INTERVAL: 90,
    THEME: 'light',
    BLUE_FILTER: false,
    BLUE_INTENSITY: 50
};

let reminderInterval = DEFAULTS.REMINDER_INTERVAL;
let reminderText = DEFAULTS.REMINDER_TEXT;
let notificationTimer = null;
let blueFilterEnabled = false;
let blueFilterIntensity = 50;

// ========== УТИЛИТЫ ==========
function getStoredValue(key, defaultValue) {
    return localStorage.getItem(key) || defaultValue;
}

function setStoredValue(key, value) {
    localStorage.setItem(key, value);
}

// ========== МОДАЛКИ ==========
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = '';
    }
};

// ========== ПРОФИЛЬ ==========
function loadUsername() {
    return getStoredValue(STORAGE_KEYS.USERNAME, DEFAULTS.USERNAME);
}

function saveUsername(name) {
    setStoredValue(STORAGE_KEYS.USERNAME, name);
    const display = document.getElementById('usernameDisplay');
    const input = document.getElementById('usernameInput');
    if (display) display.textContent = name;
    if (input) input.value = name;
}

function previewAvatar(input) {
    const file = input?.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatar = document.getElementById('avatarPreview');
        const miniAvatar = document.getElementById('aboutAvatarMini');
        
        if (avatar) {
            avatar.style.backgroundImage = `url(${e.target.result})`;
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
            avatar.innerHTML = '';
        }
        
        if (miniAvatar) {
            miniAvatar.style.backgroundImage = `url(${e.target.result})`;
            miniAvatar.style.backgroundSize = 'cover';
            miniAvatar.style.backgroundPosition = 'center';
            miniAvatar.innerHTML = '';
        }
    };
    reader.readAsDataURL(file);
}

function previewBanner(input) {
    const file = input?.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const banner = document.getElementById('bannerPreview');
        if (banner) {
            banner.style.backgroundImage = `url(${e.target.result})`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
            
            const container = banner.closest('.banner-container');
            if (container) {
                container.style.background = 'none';
            }
        }
    };
    reader.readAsDataURL(file);
}

function setBorderColor(color) {
    const avatar = document.getElementById('avatarPreview');
    const picker = document.getElementById('borderColorPicker');
    
    if (avatar) avatar.style.borderColor = color;
    if (picker) picker.value = color;
    setStoredValue(STORAGE_KEYS.AVATAR_BORDER, color);
}

function loadBorderColor() {
    const color = getStoredValue(STORAGE_KEYS.AVATAR_BORDER, DEFAULTS.AVATAR_BORDER);
    setBorderColor(color);
}

function saveProfileChanges() {
    const input = document.getElementById('usernameInput');
    if (input) {
        const newName = input.value.trim();
        if (newName) saveUsername(newName);
    }
    closeModal('editProfileModal');
    showBreakNotification('✅ Профиль обновлен');
}

// ========== О СЕБЕ ==========
function loadAbout() {
    return getStoredValue(STORAGE_KEYS.ABOUT, DEFAULTS.ABOUT);
}

function enableAboutEdit() {
    const viewMode = document.getElementById('aboutViewMode');
    const editMode = document.getElementById('aboutEditMode');
    const textarea = document.getElementById('aboutTextarea');
    
    if (viewMode) viewMode.style.display = 'none';
    if (editMode) editMode.style.display = 'block';
    if (textarea) {
        textarea.value = loadAbout();
        textarea.focus();
    }
}

function cancelAboutEdit() {
    const viewMode = document.getElementById('aboutViewMode');
    const editMode = document.getElementById('aboutEditMode');
    
    if (viewMode) viewMode.style.display = 'flex';
    if (editMode) editMode.style.display = 'none';
}

function saveAboutDescription() {
    const textarea = document.getElementById('aboutTextarea');
    const display = document.getElementById('aboutTextDisplay');
    
    if (textarea && display) {
        const newText = textarea.value.trim();
        const textToSave = newText || DEFAULTS.ABOUT;
        
        setStoredValue(STORAGE_KEYS.ABOUT, textToSave);
        display.textContent = textToSave;
    }
    
    cancelAboutEdit();
    showBreakNotification('✅ Описание сохранено');
}

// ========== НАПОМИНАНИЯ ==========
function loadReminderSettings() {
    reminderText = getStoredValue(STORAGE_KEYS.REMINDER_TEXT, DEFAULTS.REMINDER_TEXT);
    reminderInterval = parseInt(getStoredValue(STORAGE_KEYS.REMINDER_INTERVAL, DEFAULTS.REMINDER_INTERVAL));
    
    const elements = {
        textInput: document.getElementById('reminderTextInput'),
        intervalInput: document.getElementById('intervalInput'),
        previewText: document.getElementById('reminderPreviewText'),
        previewInterval: document.getElementById('reminderPreviewInterval'),
        notificationMsg: document.getElementById('breakNotificationMessage')
    };
    
    if (elements.textInput) elements.textInput.value = reminderText;
    if (elements.intervalInput) elements.intervalInput.value = reminderInterval;
    if (elements.previewText) elements.previewText.textContent = reminderText;
    if (elements.previewInterval) elements.previewInterval.textContent = reminderInterval + ' мин';
    if (elements.notificationMsg) elements.notificationMsg.textContent = reminderText;
    
    highlightActivePreset(reminderInterval);
}

function highlightActivePreset(interval) {
    document.querySelectorAll('.interval-preset').forEach(preset => {
        preset.classList.remove('active-preset');
        const onclickAttr = preset.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(interval.toString())) {
            preset.classList.add('active-preset');
        }
    });
}

function setIntervalPreset(minutes) {
    const intervalInput = document.getElementById('intervalInput');
    const previewInterval = document.getElementById('reminderPreviewInterval');
    
    if (intervalInput) intervalInput.value = minutes;
    if (previewInterval) previewInterval.textContent = minutes + ' мин';
    
    highlightActivePreset(minutes);
}

function saveReminderSettings() {
    const textInput = document.getElementById('reminderTextInput');
    const intervalInput = document.getElementById('intervalInput');
    
    if (textInput) {
        const newText = textInput.value.trim();
        if (newText) {
            reminderText = newText;
            setStoredValue(STORAGE_KEYS.REMINDER_TEXT, newText);
        }
    }
    
    if (intervalInput) {
        const newInterval = parseInt(intervalInput.value);
        if (!isNaN(newInterval) && newInterval >= 5 && newInterval <= 240) {
            reminderInterval = newInterval;
            setStoredValue(STORAGE_KEYS.REMINDER_INTERVAL, newInterval);
        }
    }
    
    loadReminderSettings();
    startReminderTimer();
    closeModal('reminderModal');
    showBreakNotification('✅ Настройки сохранены');
}

function resetReminderDefaults() {
    const textInput = document.getElementById('reminderTextInput');
    const intervalInput = document.getElementById('intervalInput');
    
    if (textInput) textInput.value = DEFAULTS.REMINDER_TEXT;
    if (intervalInput) intervalInput.value = DEFAULTS.REMINDER_INTERVAL;
    
    document.getElementById('reminderPreviewText').textContent = DEFAULTS.REMINDER_TEXT;
    document.getElementById('reminderPreviewInterval').textContent = DEFAULTS.REMINDER_INTERVAL + ' мин';
    
    highlightActivePreset(DEFAULTS.REMINDER_INTERVAL);
    showBreakNotification('🔄 Настройки сброшены');
}

function testReminder() {
    const textInput = document.getElementById('reminderTextInput');
    const text = textInput?.value.trim() || reminderText;
    showBreakNotification('🔔 Тест: ' + text);
}

function showBreakNotification(message = null) {
    const notification = document.getElementById('breakNotification');
    const messageElement = document.getElementById('breakNotificationMessage');
    
    if (messageElement) {
        messageElement.textContent = message || reminderText;
    }
    
    if (notification) {
        notification.style.display = 'flex';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    }
}

function hideBreakNotification() {
    const notification = document.getElementById('breakNotification');
    if (notification) {
        notification.style.display = 'none';
    }
}

function startReminderTimer() {
    if (notificationTimer) {
        clearInterval(notificationTimer);
    }
    
    notificationTimer = setInterval(() => {
        showBreakNotification(reminderText);
    }, reminderInterval * 60 * 1000);
}

// ========== БИБЛИОТЕКА ==========
function switchTab(activeTab, category) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
    console.log(`Switched to ${category} tab`);
}

// ========== ТЕМА ==========
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || DEFAULTS.THEME;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    setStoredValue(STORAGE_KEYS.THEME, newTheme);
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function loadTheme() {
    const theme = getStoredValue(STORAGE_KEYS.THEME, DEFAULTS.THEME);
    document.body.setAttribute('data-theme', theme);
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ========== ФИЛЬТР СИНЕГО ==========
function toggleBlueLightFilter() {
    const body = document.body;
    const btn = document.getElementById('blueLightToggleBtn');
    const knob = document.getElementById('blueLightToggleKnob');
    const status = document.getElementById('blueLightStatus');
    const intensityControl = document.getElementById('blueIntensityControl');
    
    blueFilterEnabled = !blueFilterEnabled;
    
    if (blueFilterEnabled) {
        body.classList.add('blue-light-filter');
        if (btn) {
            btn.style.background = 'var(--gradient-primary)';
            btn.style.borderColor = 'transparent';
            knob.style.left = '32px';
            knob.style.background = 'white';
        }
        if (status) {
            status.innerHTML = 'Фильтр синего включен';
            status.style.color = 'var(--primary)';
        }
        if (intensityControl) {
            intensityControl.style.display = 'block';
        }
        
        // Применяем интенсивность
        const intensity = document.getElementById('blueIntensitySlider')?.value || blueFilterIntensity;
        updateBlueIntensity(intensity);
    } else {
        body.classList.remove('blue-light-filter');
        if (btn) {
            btn.style.background = 'var(--surface-solid)';
            btn.style.borderColor = 'var(--border)';
            knob.style.left = '4px';
            knob.style.background = 'var(--text-muted)';
        }
        if (status) {
            status.innerHTML = 'Фильтр синего выключен';
            status.style.color = 'var(--text-secondary)';
        }
        if (intensityControl) {
            intensityControl.style.display = 'none';
        }
    }
    
    setStoredValue(STORAGE_KEYS.BLUE_FILTER, blueFilterEnabled);
}

function updateBlueIntensity(value) {
    blueFilterIntensity = value;
    const intensitySpan = document.getElementById('intensityValue');
    if (intensitySpan) intensitySpan.textContent = value + '%';
    
    // Обновляем градиент ползунка
    const slider = document.getElementById('blueIntensitySlider');
    if (slider) {
        slider.style.background = `linear-gradient(90deg, var(--primary) 0%, var(--primary) ${value}%, var(--border) ${value}%, var(--border) 100%)`;
    }
    
    // Применяем интенсивность к фильтру
    if (blueFilterEnabled) {
        const body = document.body;
        const intensity = value / 100;
        const filterValue = `sepia(${0.3 * intensity}) hue-rotate(${180 * intensity}deg) saturate(${0.8 + (0.2 * (1 - intensity))})`;
        
        // Обновляем CSS переменную или применяем напрямую
        const style = document.createElement('style');
        style.id = 'blue-filter-intensity';
        style.innerHTML = `
            body.blue-light-filter .profile-card,
            body.blue-light-filter .section,
            body.blue-light-filter .modal-content,
            body.blue-light-filter .notification,
            body.blue-light-filter .header {
                filter: ${filterValue} !important;
            }
        `;
        
        const oldStyle = document.getElementById('blue-filter-intensity');
        if (oldStyle) oldStyle.remove();
        document.head.appendChild(style);
    }
    
    setStoredValue(STORAGE_KEYS.BLUE_INTENSITY, value);
}

function loadBlueFilterSettings() {
    blueFilterEnabled = getStoredValue(STORAGE_KEYS.BLUE_FILTER, DEFAULTS.BLUE_FILTER) === 'true';
    blueFilterIntensity = parseInt(getStoredValue(STORAGE_KEYS.BLUE_INTENSITY, DEFAULTS.BLUE_INTENSITY));
    
    if (blueFilterEnabled) {
        document.body.classList.add('blue-light-filter');
        
        const btn = document.getElementById('blueLightToggleBtn');
        const knob = document.getElementById('blueLightToggleKnob');
        const status = document.getElementById('blueLightStatus');
        const intensityControl = document.getElementById('blueIntensityControl');
        const slider = document.getElementById('blueIntensitySlider');
        
        if (btn) {
            btn.style.background = 'var(--gradient-primary)';
            btn.style.borderColor = 'transparent';
            knob.style.left = '32px';
            knob.style.background = 'white';
        }
        if (status) {
            status.innerHTML = 'Фильтр синего включен';
            status.style.color = 'var(--primary)';
        }
        if (intensityControl) {
            intensityControl.style.display = 'block';
        }
        if (slider) {
            slider.value = blueFilterIntensity;
            updateBlueIntensity(blueFilterIntensity);
        }
    }
}

// ========== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ УЛУЧШЕННЫХ МОДАЛОК ==========
function updateAvatarPreview(input) {
    const file = input?.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('avatarPreviewSmall');
        if (preview) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.innerHTML = '';
        }
    };
    reader.readAsDataURL(file);
}

function updateBannerPreview(input) {
    const file = input?.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('bannerPreviewSmall');
        if (preview) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
        }
    };
    reader.readAsDataURL(file);
}

function resetBanner() {
    const preview = document.getElementById('bannerPreviewSmall');
    if (preview) {
        preview.style.backgroundImage = '';
        preview.style.background = 'var(--gradient-sunset)';
    }
    
    const banner = document.getElementById('bannerPreview');
    if (banner) {
        banner.style.backgroundImage = '';
        banner.style.background = 'var(--gradient-sunset)';
    }
    
    const input = document.getElementById('bannerInput');
    if (input) input.value = '';
}

function filterAchievements(filter) {
    const items = document.querySelectorAll('.achievement-full-item');
    items.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'flex';
        } else if (filter === 'unlocked') {
            item.style.display = item.classList.contains('unlocked') ? 'flex' : 'none';
        } else if (filter === 'locked') {
            item.style.display = item.classList.contains('locked') ? 'flex' : 'none';
        } else if (filter === 'progress') {
            item.style.display = !item.classList.contains('unlocked') && !item.classList.contains('locked') ? 'flex' : 'none';
        }
    });
    
    // Подсветка активной кнопки
    const buttons = document.querySelectorAll('#achievementsModal .btn');
    buttons.forEach(btn => {
        btn.style.background = 'var(--surface)';
        btn.style.color = 'var(--text-primary)';
    });
    event.target.style.background = 'var(--gradient-primary)';
    event.target.style.color = 'white';
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function initializeApp() {
    // Загрузка всех сохраненных данных
    saveUsername(loadUsername());
    
    const aboutText = loadAbout();
    const aboutDisplay = document.getElementById('aboutTextDisplay');
    const aboutTextarea = document.getElementById('aboutTextarea');
    
    if (aboutDisplay) aboutDisplay.textContent = aboutText;
    if (aboutTextarea) aboutTextarea.value = aboutText;
    
    loadBorderColor();
    loadReminderSettings();
    loadTheme();
    loadBlueFilterSettings();
    startReminderTimer();
    
    // Активация первой вкладки
    const firstTab = document.querySelector('.tab');
    if (firstTab) firstTab.classList.add('active');
    
    // Установка CSS-переменной для vh
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    
    // Обновление предпросмотра имени
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            const preview = document.getElementById('previewUsername');
            if (preview) {
                preview.textContent = this.value.trim() || 'Книжный странник';
            }
        });
    }
    
    console.log('✨ Spectra Profile initialized');
}

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ========== SERVICE WORKER (PWA) ==========
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed:', err);
        });
    });
}