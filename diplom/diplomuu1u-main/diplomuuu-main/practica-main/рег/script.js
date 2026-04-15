// ========== ИНИЦИАЛИЗАЦИЯ ==========
(function() {
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('spectra_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
})();

// ========== ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ==========
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('spectra_theme', newTheme);
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ========== ПОКАЗ/СКРЫТИЕ ПАРОЛЯ ==========
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        btn.style.background = 'var(--gradient-primary)';
        btn.style.color = 'white';
        btn.style.borderColor = 'transparent';
    } else {
        input.type = "password";
        btn.style.background = 'var(--surface)';
        btn.style.color = 'var(--text-tertiary)';
        btn.style.borderColor = 'var(--border-light)';
    }
}

// ========== ВАЛИДАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    const confirmError = document.getElementById('confirm-error');
    const form = document.getElementById('regForm');
    const passwordHint = document.getElementById('password-hint');

    // Валидация email
    function validateEmail(email) {
        const isEnglish = !/[а-яА-ЯёЁ]/.test(email);
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email) && isEnglish;
    }

    // Валидация пароля
    function validatePassword(password) {
        return {
            length: password.length >= 8,
            english: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password) && !/[а-яА-ЯёЁ]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasDigitOrSymbol: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
    }

    // Обновление подсказки по паролю
    function updatePasswordHint(password) {
        const rules = validatePassword(password);
        const hintItems = {
            'hint-length': rules.length,
            'hint-english': rules.english,
            'hint-upper': rules.hasUpper,
            'hint-lower': rules.hasLower,
            'hint-symbol': rules.hasDigitOrSymbol
        };

        for (const [id, isValid] of Object.entries(hintItems)) {
            const element = document.getElementById(id);
            if (element) {
                const icon = element.querySelector('i');
                if (isValid) {
                    element.classList.add('valid');
                    element.classList.remove('invalid');
                    icon.className = 'fas fa-check-circle';
                    icon.style.color = 'var(--success)';
                } else {
                    element.classList.add('invalid');
                    element.classList.remove('valid');
                    icon.className = 'fas fa-circle';
                    icon.style.color = 'var(--text-muted)';
                }
            }
        }
    }

    // Обновление иконки валидации
    function updateValidationIcon(input, isValid) {
        const formGroup = input.closest('.form-group');
        const icons = formGroup.querySelectorAll('.validation-icon i');
        
        if (input.value.length === 0) {
            icons.forEach(icon => icon.style.display = 'none');
            input.classList.remove('valid', 'invalid');
            return;
        }

        if (isValid) {
            input.classList.add('valid');
            input.classList.remove('invalid');
            icons[0].style.display = 'block';
            icons[1].style.display = 'none';
        } else {
            input.classList.add('invalid');
            input.classList.remove('valid');
            icons[0].style.display = 'none';
            icons[1].style.display = 'block';
        }
    }

    // События для email
    emailInput.addEventListener('input', function() {
        const val = this.value;
        const isValid = val.length === 0 ? true : validateEmail(val);
        
        if (val.length === 0) {
            emailError.style.display = 'none';
        } else {
            emailError.style.display = isValid ? 'none' : 'block';
        }
        
        updateValidationIcon(this, isValid);
    });

    // События для пароля
    passwordInput.addEventListener('focus', function() {
        passwordHint.classList.add('show');
    });

    passwordInput.addEventListener('blur', function() {
        // Не скрываем сразу, даем время кликнуть
        setTimeout(() => {
            if (!passwordHint.matches(':hover')) {
                passwordHint.classList.remove('show');
            }
        }, 200);
    });

    passwordHint.addEventListener('mouseleave', function() {
        if (!passwordInput.matches(':focus')) {
            passwordHint.classList.remove('show');
        }
    });

    passwordInput.addEventListener('input', function() {
        const val = this.value;
        const rules = validatePassword(val);
        const isValid = val.length === 0 ? true : (
            rules.length && rules.english && rules.hasUpper && 
            rules.hasLower && rules.hasDigitOrSymbol
        );
        
        updatePasswordHint(val);
        updateValidationIcon(this, isValid);
    });

    // События для подтверждения пароля
    confirmInput.addEventListener('input', function() {
        const pass = passwordInput.value;
        const confirm = this.value;
        const isValid = confirm.length === 0 ? true : (pass === confirm);
        
        confirmError.style.display = (confirm.length > 0 && !isValid) ? 'block' : 'none';
        updateValidationIcon(this, isValid);
    });

    // ========== ОТПРАВКА ФОРМЫ ==========
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const isEmailValid = validateEmail(emailInput.value);
        const passRules = validatePassword(passwordInput.value);
        const isPassValid = passRules.length && passRules.english && 
                          passRules.hasUpper && passRules.hasLower && passRules.hasDigitOrSymbol;
        const isMatch = passwordInput.value === confirmInput.value;
        const isConsent = document.getElementById('consent').checked;

        if (!isEmailValid || !isPassValid || !isMatch || !isConsent) {
            // Показываем ошибки
            if (!isEmailValid) {
                emailError.style.display = 'block';
                updateValidationIcon(emailInput, false);
            }
            if (!isPassValid) {
                passwordHint.classList.add('show');
                passwordInput.classList.add('invalid');
            }
            if (!isMatch) {
                confirmError.style.display = 'block';
                updateValidationIcon(confirmInput, false);
            }
            if (!isConsent) {
                showNotification('❌ Необходимо согласие на обработку данных', 'error');
            }
            return;
        }

        // Успешная отправка
        showNotification('✅ Регистрация прошла успешно!', 'success');
        
        // Сброс формы
        this.reset();
        
        // Очистка классов валидации
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('valid', 'invalid');
            const icons = input.closest('.form-group')?.querySelectorAll('.validation-icon i');
            icons?.forEach(icon => icon.style.display = 'none');
        });
        
        // Скрываем ошибки
        emailError.style.display = 'none';
        confirmError.style.display = 'none';
    });

    // ========== ЗАЩИТА ОТ КОПИ-ПАСТЫ В ПОДТВЕРЖДЕНИИ ==========
    confirmInput.addEventListener('paste', function(e) {
        e.preventDefault();
        showNotification('❌ Вставка запрещена, введите пароль вручную', 'error');
    });

    // ========== УТИЛИТЫ ==========
    // Закрытие подсказок по клику вне
    document.addEventListener('click', function(e) {
        if (!passwordInput.contains(e.target) && !passwordHint.contains(e.target)) {
            passwordHint.classList.remove('show');
        }
    });
});

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type = 'success') {
    const notification = document.getElementById('successNotification');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    const icon = notification.querySelector('i');
    
messageEl.textContent = message;
    
    if (type === 'success') {
        titleEl.textContent = 'УСПЕШНО'; // Заголовок для успеха
        icon.style.color = 'var(--success)';
        notification.style.borderLeftColor = 'var(--success)';
        icon.className = 'fas fa-check-circle';
    } else {
        titleEl.textContent = 'ОШИБКА';   // Заголовок для ошибки
        icon.style.color = 'var(--danger)';
        notification.style.borderLeftColor = 'var(--danger)';
        icon.className = 'fas fa-exclamation-triangle';
    }
    
    notification.style.display = 'flex';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

console.log('✨ Spectra Registration initialized');