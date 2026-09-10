(function () {
    "use strict";

    const STORAGE_KEY = "tatua-a11y-settings";

    const THEMES = [
        {value: "default", label: "Default"},
        {value: "dark", label: "Dark"},
        {value: "contrast", label: "High contrast"}
    ];

    const FONTS = [
        {
            value: "asap",
            label: "Asap",
            stack: "\"Asap\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif"
        },
        {
            value: "lexend",
            label: "Lexend Deca",
            stack: "\"Lexend Deca\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif"
        },
        {
            value: "inter",
            label: "Inter",
            stack: "\"Inter\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif"
        }
    ];

    const DEFAULTS = {theme: "default", fontSize: 100, radius: 4, font: "asap"};
    const FONT_SIZE_MIN = 87.5;
    const FONT_SIZE_MAX = 150;
    const FONT_SIZE_STEP = 12.5;
    const RADIUS_MIN = 0;
    const RADIUS_MAX = 20;

    function fontStack(key) {
        for (let i = 0; i < FONTS.length; i++) {
            if (FONTS[i].value === key) return FONTS[i].stack;
        }
        return FONTS[0].stack;
    }

    function loadSettings() {
        const settings = {};
        for (const key in DEFAULTS) settings[key] = DEFAULTS[key];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                for (const k in DEFAULTS) {
                    if (parsed[k] !== undefined) settings[k] = parsed[k];
                }
            }
        } catch (e) {
            /* localStorage unavailable — fall back to defaults */
        }
        return settings;
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            /* ignore */
        }
    }

    function applySettings(settings) {
        const html = document.documentElement;

        if (settings.theme && settings.theme !== "default") {
            html.setAttribute("data-theme", settings.theme);
        } else {
            html.removeAttribute("data-theme");
        }

        html.style.fontSize = settings.fontSize + "%";
        html.style.setProperty("--radius", settings.radius + "px");
        html.style.setProperty("--font-family-base", fontStack(settings.font));
    }

    let settings = loadSettings();
    applySettings(settings);

    function buildWidget() {
        const container = document.createElement("div");
        container.className = "a11y-widget";

        container.innerHTML =
            '<button type="button" class="a11y-toggle" id="a11y-toggle" aria-expanded="false" aria-controls="a11y-panel" aria-label="Accessibility settings">' +
            '<i class="fa-solid fa-universal-access" aria-hidden="true"></i>' +
            "</button>" +
            '<div class="a11y-panel" id="a11y-panel" role="region" aria-label="Accessibility settings" hidden>' +
            '<div class="a11y-panel__header">' +
            '<h2 class="a11y-panel__title" id="a11y-panel-title">Accessibility</h2>' +
            '<button type="button" class="a11y-panel__close" id="a11y-close" aria-label="Close accessibility settings"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
            "</div>" +
            '<fieldset class="a11y-field">' +
            "<legend>Theme</legend>" +
            '<div class="a11y-options" id="a11y-theme-options"></div>' +
            "</fieldset>" +
            '<div class="a11y-field">' +
            '<label class="a11y-field__label" for="a11y-fontsize">Text size</label>' +
            '<div class="a11y-field__row">' +
            '<input type="range" id="a11y-fontsize" min="' + FONT_SIZE_MIN + '" max="' + FONT_SIZE_MAX + '" step="' + FONT_SIZE_STEP + '">' +
            '<span class="a11y-field__value" id="a11y-fontsize-value"></span>' +
            "</div>" +
            "</div>" +
            '<div class="a11y-field">' +
            '<label class="a11y-field__label" for="a11y-radius">Corner roundness</label>' +
            '<div class="a11y-field__row">' +
            '<input type="range" id="a11y-radius" min="' + RADIUS_MIN + '" max="' + RADIUS_MAX + '" step="1">' +
            '<span class="a11y-field__value" id="a11y-radius-value"></span>' +
            "</div>" +
            "</div>" +
            '<fieldset class="a11y-field">' +
            "<legend>Font</legend>" +
            '<div class="a11y-options" id="a11y-font-options"></div>' +
            "</fieldset>" +
            '<button type="button" class="a11y-reset" id="a11y-reset">Reset to defaults</button>' +
            "</div>";

        document.body.appendChild(container);

        const toggle = container.querySelector("#a11y-toggle");
        const panel = container.querySelector("#a11y-panel");
        const closeBtn = container.querySelector("#a11y-close");
        const fontSizeInput = container.querySelector("#a11y-fontsize");
        const fontSizeValue = container.querySelector("#a11y-fontsize-value");
        const radiusInput = container.querySelector("#a11y-radius");
        const radiusValue = container.querySelector("#a11y-radius-value");
        const resetBtn = container.querySelector("#a11y-reset");
        const themeGroup = container.querySelector("#a11y-theme-options");
        const fontGroup = container.querySelector("#a11y-font-options");

        function buildRadioGroup(group, name, items, currentValue, onChange) {
            group.innerHTML = "";
            items.forEach(function (item, index) {
                const id = "a11y-" + name + "-" + index;
                const wrapper = document.createDocumentFragment();

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "a11y-" + name;
                input.id = id;
                input.value = item.value;
                input.checked = item.value === currentValue;

                const label = document.createElement("label");
                label.setAttribute("for", id);
                label.textContent = item.label;

                input.addEventListener("change", function () {
                    if (input.checked) onChange(item.value);
                });

                wrapper.appendChild(input);
                wrapper.appendChild(label);
                group.appendChild(wrapper);
            });
        }

        function refreshControls() {
            fontSizeInput.value = settings.fontSize;
            fontSizeValue.textContent = settings.fontSize + "%";
            radiusInput.value = settings.radius;
            radiusValue.textContent = settings.radius + "px";
            buildRadioGroup(themeGroup, "theme", THEMES, settings.theme, function (value) {
                settings.theme = value;
                applySettings(settings);
                saveSettings(settings);
            });
            buildRadioGroup(fontGroup, "font", FONTS, settings.font, function (value) {
                settings.font = value;
                applySettings(settings);
                saveSettings(settings);
            });
        }

        function openPanel() {
            panel.hidden = false;
            toggle.setAttribute("aria-expanded", "true");
            closeBtn.focus();
            document.addEventListener("keydown", onKeydown);
            document.addEventListener("click", onDocumentClick, true);
        }

        function closePanel(focusToggle) {
            panel.hidden = true;
            toggle.setAttribute("aria-expanded", "false");
            document.removeEventListener("keydown", onKeydown);
            document.removeEventListener("click", onDocumentClick, true);
            if (focusToggle) toggle.focus();
        }

        function onKeydown(event) {
            if (event.key === "Escape") closePanel(true);
        }

        function onDocumentClick(event) {
            if (!container.contains(event.target)) closePanel(false);
        }

        toggle.addEventListener("click", function () {
            if (panel.hidden) openPanel(); else closePanel(true);
        });

        closeBtn.addEventListener("click", function () {
            closePanel(true);
        });

        fontSizeInput.addEventListener("input", function () {
            settings.fontSize = parseFloat(fontSizeInput.value);
            fontSizeValue.textContent = settings.fontSize + "%";
            applySettings(settings);
            saveSettings(settings);
        });

        radiusInput.addEventListener("input", function () {
            settings.radius = parseFloat(radiusInput.value);
            radiusValue.textContent = settings.radius + "px";
            applySettings(settings);
            saveSettings(settings);
        });

        resetBtn.addEventListener("click", function () {
            settings = {};
            for (const k in DEFAULTS) settings[k] = DEFAULTS[k];
            applySettings(settings);
            saveSettings(settings);
            refreshControls();
        });

        refreshControls();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildWidget);
    } else {
        buildWidget();
    }
})();
