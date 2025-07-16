// toast-notifications.js - Toast notification system
(function(global) {
    'use strict';

    class ToastNotificationService {
        constructor() {
            this.container = null;
            this.toasts = [];
            this.init();
        }

        init() {
            // Create toast container
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }

        show(message, type = 'info', duration = 4000) {
            const toast = this.createToast(message, type, duration);
            this.container.appendChild(toast);
            this.toasts.push(toast);

            // Trigger animation
            setTimeout(() => {
                toast.classList.add('toast-show');
            }, 10);

            // Auto remove
            setTimeout(() => {
                this.remove(toast);
            }, duration);

            return toast;
        }

        createToast(message, type, duration) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const icon = this.getIcon(type);
            const progressBar = document.createElement('div');
            progressBar.className = 'toast-progress';
            progressBar.style.animationDuration = `${duration}ms`;
            
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${icon}</span>
                    <span class="toast-message">${message}</span>
                    <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            toast.appendChild(progressBar);
            
            // Add click to dismiss
            toast.addEventListener('click', () => {
                this.remove(toast);
            });

            return toast;
        }

        getIcon(type) {
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            return icons[type] || icons.info;
        }

        remove(toast) {
            if (toast && toast.parentElement) {
                toast.classList.add('toast-hide');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.parentElement.removeChild(toast);
                    }
                    this.toasts = this.toasts.filter(t => t !== toast);
                }, 300);
            }
        }

        removeAll() {
            this.toasts.forEach(toast => this.remove(toast));
            this.toasts = [];
        }
    }

    // Initialize toast service
    const toastService = new ToastNotificationService();

    // Export global function
    global.showToast = (message, type, duration) => {
        return toastService.show(message, type, duration);
    };

    // Export service for advanced usage
    global.ToastService = toastService;

})(typeof window !== 'undefined' ? window : this);