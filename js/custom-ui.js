/**
 * Custom UI Component Library
 * Replaces native <select> dropdowns and <input type="color"> with custom dark-themed UI components
 */

(function() {
    // Preset Swatches for Color Picker
    const PRESET_COLORS = [
        '#00401e', '#b1953a', '#001a0c', '#090d16',
        '#1e293b', '#2563eb', '#dc2626', '#16a34a',
        '#ca8a04', '#9333ea', '#ffffff', '#000000'
    ];

    /**
     * Initializes a custom select dropdown component for a native <select>
     */
    window.initCustomSelect = function(nativeSelect) {
        if (!nativeSelect || nativeSelect.dataset.customUiInitialized) return;
        nativeSelect.dataset.customUiInitialized = 'true';

        // Hide native select
        nativeSelect.style.display = 'none';

        // Create custom wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'ui-select-wrapper';

        const trigger = document.createElement('div');
        trigger.className = 'ui-select-trigger';

        const triggerText = document.createElement('span');
        const triggerArrow = document.createElement('span');
        triggerArrow.className = 'ui-select-arrow';
        triggerArrow.textContent = '▾';

        trigger.appendChild(triggerText);
        trigger.appendChild(triggerArrow);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'ui-select-options';

        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsContainer);

        // Insert wrapper in place of native select
        nativeSelect.parentNode.insertBefore(wrapper, nativeSelect.nextSibling);

        function updateOptions() {
            optionsContainer.innerHTML = '';
            Array.from(nativeSelect.options).forEach(opt => {
                const optEl = document.createElement('div');
                optEl.className = 'ui-select-option';
                if (opt.selected) {
                    optEl.classList.add('selected');
                    triggerText.textContent = opt.textContent;
                }
                optEl.textContent = opt.textContent;
                optEl.dataset.value = opt.value;

                optEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    nativeSelect.value = opt.value;
                    nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    updateOptions();
                    wrapper.classList.remove('open');
                });

                optionsContainer.appendChild(optEl);
            });
        }

        updateOptions();

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('open');
            closeAllCustomUi();
            if (!isOpen) {
                updateOptions();
                wrapper.classList.add('open');
            }
        });

        // Method to refresh from external changes
        nativeSelect._updateCustomSelect = function() {
            updateOptions();
        };

        nativeSelect.addEventListener('change', () => {
            updateOptions();
        });
    };

    /**
     * Initializes a custom color picker component for a native <input type="color">
     */
    window.initCustomColorPicker = function(nativeInput) {
        if (!nativeInput || nativeInput.dataset.customUiInitialized) return;
        nativeInput.dataset.customUiInitialized = 'true';

        // Hide native color input
        nativeInput.style.display = 'none';

        // Create custom wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'ui-color-wrapper';

        const trigger = document.createElement('div');
        trigger.className = 'ui-color-trigger';

        const preview = document.createElement('div');
        preview.className = 'ui-color-swatch-preview';

        const hexText = document.createElement('span');
        hexText.className = 'ui-color-hex-text';

        trigger.appendChild(preview);
        trigger.appendChild(hexText);

        // Popover
        const popover = document.createElement('div');
        popover.className = 'ui-color-popover';

        const titlePresets = document.createElement('div');
        titlePresets.className = 'ui-color-title';
        titlePresets.textContent = 'Presets';

        const presetsGrid = document.createElement('div');
        presetsGrid.className = 'ui-color-presets';

        PRESET_COLORS.forEach(hex => {
            const swatch = document.createElement('div');
            swatch.className = 'ui-preset-swatch';
            swatch.style.backgroundColor = hex;
            swatch.title = hex;
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                applyColor(hex);
            });
            presetsGrid.appendChild(swatch);
        });

        // Custom Hex Row
        const titleCustom = document.createElement('div');
        titleCustom.className = 'ui-color-title';
        titleCustom.textContent = 'Custom Hex';

        const inputGroup = document.createElement('div');
        inputGroup.className = 'ui-color-input-group';

        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.className = 'ui-color-hex-input';
        hexInput.maxLength = 7;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'ui-color-close-btn';
        closeBtn.textContent = 'Done';

        inputGroup.appendChild(hexInput);
        inputGroup.appendChild(closeBtn);

        popover.appendChild(titlePresets);
        popover.appendChild(presetsGrid);
        popover.appendChild(titleCustom);
        popover.appendChild(inputGroup);

        wrapper.appendChild(trigger);
        wrapper.appendChild(popover);

        nativeInput.parentNode.insertBefore(wrapper, nativeInput.nextSibling);

        function updateDisplay(hexVal) {
            if (!hexVal) hexVal = '#000000';
            if (!hexVal.startsWith('#')) hexVal = '#' + hexVal;
            preview.style.backgroundColor = hexVal;
            hexText.textContent = hexVal.toUpperCase();
            hexInput.value = hexVal.toUpperCase();
        }

        function applyColor(hexVal) {
            if (!hexVal.startsWith('#')) hexVal = '#' + hexVal;
            if (/^#[0-9A-F]{6}$/i.test(hexVal)) {
                nativeInput.value = hexVal;
                updateDisplay(hexVal);
                nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
                nativeInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        updateDisplay(nativeInput.value);

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('open');
            closeAllCustomUi();
            if (!isOpen) {
                updateDisplay(nativeInput.value);
                wrapper.classList.add('open');
            }
        });

        hexInput.addEventListener('input', () => {
            const val = hexInput.value.trim();
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                applyColor(val);
            }
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.classList.remove('open');
        });

        popover.addEventListener('click', (e) => e.stopPropagation());

        nativeInput._updateCustomColor = function() {
            updateDisplay(nativeInput.value);
        };

        nativeInput.addEventListener('change', () => {
            updateDisplay(nativeInput.value);
        });
    };

    /**
     * Auto-enhances all select and color inputs in a given container or document
     */
    window.enhanceAllCustomUi = function(container = document) {
        container.querySelectorAll('select').forEach(select => {
            window.initCustomSelect(select);
        });
        container.querySelectorAll('input[type="color"]').forEach(input => {
            window.initCustomColorPicker(input);
        });
    };

    function closeAllCustomUi() {
        document.querySelectorAll('.ui-select-wrapper.open, .ui-color-wrapper.open').forEach(el => {
            el.classList.remove('open');
        });
    }

    document.addEventListener('click', closeAllCustomUi);

    document.addEventListener('DOMContentLoaded', () => {
        window.enhanceAllCustomUi();
    });
})();
