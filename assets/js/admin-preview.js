/* Admin settings live-preview and accordion helpers.
 * Dynamic values (primary colour, i18n labels) are passed via wp_localize_script as iiqaptAdminData.
 */
function iiqaptTogglePreview(id) {
    var textarea = document.getElementById(id);
    var preview  = document.getElementById(id + '-preview');
    var btn      = document.getElementById(id + '-btn');
    var editMode = textarea.style.display !== 'none';
    textarea.style.display = editMode ? 'none' : '';
    preview.style.display  = editMode ? '' : 'none';
    if (editMode) { preview.textContent = textarea.value; }
    btn.textContent = editMode
        ? (typeof iiqaptAdminData !== 'undefined' ? iiqaptAdminData.labelEditHtml : 'Edit HTML')
        : (typeof iiqaptAdminData !== 'undefined' ? iiqaptAdminData.labelPreview  : 'Preview');
}

(function() {
    function iiqaptConsentAccordion(cbId, cellId) {
        var cb   = document.getElementById(cbId);
        var cell = document.getElementById(cellId);
        if (!cb || !cell) return;
        var row = cell.closest('tr');
        if (!row) return;
        row.style.display = cb.checked ? '' : 'none';
        cb.addEventListener('change', function() {
            row.style.display = cb.checked ? '' : 'none';
        });
    }
    function iiqaptConsentAccordionDiv(cbId, divId) {
        var cb  = document.getElementById(cbId);
        var div = document.getElementById(divId);
        if (!cb || !div) return;
        div.style.display = cb.checked ? '' : 'none';
        cb.addEventListener('change', function() {
            div.style.display = cb.checked ? '' : 'none';
        });
    }
    iiqaptConsentAccordion('iiqapt-gdpr2-cb', 'iiqapt-gdpr2-msg-cell');
    iiqaptConsentAccordion('iiqapt-counter-cb', 'iiqapt-counter-format-row');
    iiqaptConsentAccordion('iiqapt-show-error-rate-cb', 'iiqapt-error-rate-cell');
    iiqaptConsentAccordionDiv('iiqapt-dyslexic-cb', 'iiqapt-dyslexic-details');
})();

// Primary colour from General Settings — used as fallback for any accent colour not explicitly overridden
var iiqaptPrimary = (typeof iiqaptAdminData !== 'undefined' && iiqaptAdminData.primaryColor) ? iiqaptAdminData.primaryColor : '#2563eb';

// Shared helper: read value from a named input, return fallback if not found
function iiqaptVal(name, fallback) {
    var el = document.querySelector('[name="' + name + '"]');
    return el ? el.value : fallback;
}
function iiqaptChecked(name) {
    var el = document.querySelector('[name="' + name + '"]');
    return el ? el.checked : false;
}
// Apply box card styles (bg, text, radius, border, shadow) to an element
function iiqaptApplyBox(card, prefix) {
    var bg  = iiqaptVal(prefix + '_box_bg', '');
    var txt = iiqaptVal(prefix + '_box_text_color', '');
    var rad = iiqaptVal(prefix + '_box_border_radius', '');
    var bw  = iiqaptVal(prefix + '_box_border_width', '0');
    var bc  = iiqaptVal(prefix + '_box_border_color', '#e5e7eb');
    var shd = iiqaptChecked(prefix + '_box_shadow');
    if (bg)  card.style.background   = bg;
    if (txt) card.style.color        = txt;
    if (rad) card.style.borderRadius = rad + 'px';
    card.style.border    = parseInt(bw) > 0 ? bw + 'px solid ' + bc : 'none';
    card.style.boxShadow = shd ? '0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)' : 'none';
}
// Shared helper: bind input+change events on all matching elements
function iiqaptBind(selectors, update) {
    document.querySelectorAll(selectors).forEach(function(el) {
        el.addEventListener('input',  update);
        el.addEventListener('change', update);
    });
}

// Live Preview — Before the Quiz
(function() {
    var prevCard     = document.getElementById('iiqapt-prev-card');
    var prevTitle    = document.getElementById('iiqapt-prev-title');
    if (!prevTitle) return;
    var prevSubtitle = document.getElementById('iiqapt-prev-subtitle');
    var prevBody     = document.getElementById('iiqapt-prev-body');
    var prevEmail    = document.getElementById('iiqapt-prev-email');
    var prevBtn      = document.getElementById('iiqapt-prev-btn');
    var prevGdpr     = document.getElementById('iiqapt-prev-gdpr');
    var prevGdprMsg  = document.getElementById('iiqapt-prev-gdpr-msg');

    // Dynamic style for ::placeholder (can't be set inline)
    var phStyle = document.createElement('style');
    document.head.appendChild(phStyle);

    function update() {
        // Content
        var t = document.getElementById('iiqapt-start-title');
        if (t && prevTitle) prevTitle.textContent = t.value;

        var s = document.getElementById('iiqapt-start-subtitle');
        if (s && prevSubtitle) prevSubtitle.textContent = s.value;

        var b = document.getElementById('iiqapt-start-body');
        if (b && prevBody) {
            prevBody.textContent = b.value;
            prevBody.style.display = b.value.trim() ? '' : 'none';
        }

        var ep = document.querySelector('[name="iiqapt_start_email_placeholder"]');
        if (ep && prevEmail) prevEmail.placeholder = ep.value;

        var bt = document.querySelector('[name="iiqapt_start_button_text"]');
        if (bt && prevBtn) prevBtn.textContent = bt.value;

        var cb = document.getElementById('iiqapt-gdpr2-cb');
        var gm = document.getElementById('iiqapt-start-gdpr2');
        if (cb && prevGdpr) {
            prevGdpr.style.display = cb.checked ? 'flex' : 'none';
            if (gm && prevGdprMsg) prevGdprMsg.textContent = gm.value;
        }

        // Title
        if (prevTitle) {
            prevTitle.style.color      = iiqaptVal('iiqapt_before_title_color',  '#1f2937');
            prevTitle.style.fontSize   = iiqaptVal('iiqapt_before_title_size',   '28') + 'px';
            prevTitle.style.fontWeight = iiqaptVal('iiqapt_before_title_weight', '700');
        }
        // Subtitle
        if (prevSubtitle) {
            prevSubtitle.style.color      = iiqaptVal('iiqapt_before_subtitle_color',  '#6b7280');
            prevSubtitle.style.fontSize   = iiqaptVal('iiqapt_before_subtitle_size',   '16') + 'px';
            prevSubtitle.style.fontWeight = iiqaptVal('iiqapt_before_subtitle_weight', '400');
        }
        // Body
        if (prevBody) {
            prevBody.style.color      = iiqaptVal('iiqapt_before_body_color',  '#6b7280');
            prevBody.style.fontSize   = iiqaptVal('iiqapt_before_body_size',   '12') + 'px';
            prevBody.style.fontWeight = iiqaptVal('iiqapt_before_body_weight', '400');
        }
        // Email input
        if (prevEmail) {
            var bw = iiqaptVal('iiqapt_before_input_border_width',  '2');
            var br = iiqaptVal('iiqapt_before_input_border_radius', '12');
            var bc = iiqaptVal('iiqapt_before_input_border_color',  '#e5e7eb');
            var ps = iiqaptVal('iiqapt_before_input_placeholder_size', '16');
            var pc = iiqaptVal('iiqapt_before_input_placeholder_color', '#9ca3af');
            prevEmail.style.borderWidth  = bw + 'px';
            prevEmail.style.borderStyle  = 'solid';
            prevEmail.style.borderColor  = bc;
            prevEmail.style.borderRadius = br + 'px';
            prevEmail.style.fontSize     = ps + 'px';
            phStyle.textContent = '#iiqapt-prev-email::placeholder{color:' + pc + ';}';
        }
        // Consent
        if (prevGdpr) {
            prevGdpr.style.color      = iiqaptVal('iiqapt_before_consent_color',  '#6b7280');
            prevGdpr.style.fontSize   = iiqaptVal('iiqapt_before_consent_size',   '13') + 'px';
            prevGdpr.style.fontWeight = iiqaptVal('iiqapt_before_consent_weight', '400');
        }
        // Button
        if (prevBtn) {
            prevBtn.style.background   = iiqaptVal('iiqapt_before_btn_color',         iiqaptPrimary);
            prevBtn.style.color        = iiqaptVal('iiqapt_before_btn_text_color',    '#ffffff');
            prevBtn.style.fontSize     = iiqaptVal('iiqapt_before_btn_size',          '16') + 'px';
            prevBtn.style.fontWeight   = iiqaptVal('iiqapt_before_btn_weight',        '600');
            prevBtn.style.borderColor  = iiqaptVal('iiqapt_before_btn_border_color',  iiqaptPrimary);
            prevBtn.style.borderWidth  = iiqaptVal('iiqapt_before_btn_border_width',  '2') + 'px';
            prevBtn.style.borderRadius = iiqaptVal('iiqapt_before_btn_border_radius', '12') + 'px';
            prevBtn.style.borderStyle  = 'solid';
        }
        // Box
        if (prevCard) iiqaptApplyBox(prevCard, 'iiqapt_before');
    }

    ['iiqapt-start-title','iiqapt-start-subtitle','iiqapt-start-body','iiqapt-start-gdpr2'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', update);
    });
    document.getElementById('iiqapt-gdpr2-cb') && document.getElementById('iiqapt-gdpr2-cb').addEventListener('change', update);
    iiqaptBind(
        '[name="iiqapt_start_email_placeholder"],[name="iiqapt_start_button_text"],' +
        '[name="iiqapt_before_title_color"],[name="iiqapt_before_title_size"],[name="iiqapt_before_title_weight"],' +
        '[name="iiqapt_before_subtitle_color"],[name="iiqapt_before_subtitle_size"],[name="iiqapt_before_subtitle_weight"],' +
        '[name="iiqapt_before_body_color"],[name="iiqapt_before_body_size"],[name="iiqapt_before_body_weight"],' +
        '[name="iiqapt_before_input_placeholder_color"],[name="iiqapt_before_input_placeholder_size"],' +
        '[name="iiqapt_before_input_border_width"],[name="iiqapt_before_input_border_radius"],[name="iiqapt_before_input_border_color"],' +
        '[name="iiqapt_before_consent_color"],[name="iiqapt_before_consent_size"],[name="iiqapt_before_consent_weight"],' +
        '[name="iiqapt_before_btn_color"],[name="iiqapt_before_btn_text_color"],[name="iiqapt_before_btn_size"],[name="iiqapt_before_btn_weight"],' +
        '[name="iiqapt_before_btn_border_color"],[name="iiqapt_before_btn_border_width"],[name="iiqapt_before_btn_border_radius"],' +
        '[name="iiqapt_before_box_bg"],[name="iiqapt_before_box_text_color"],[name="iiqapt_before_box_border_radius"],' +
        '[name="iiqapt_before_box_border_width"],[name="iiqapt_before_box_border_color"],[name="iiqapt_before_box_shadow"]',
        update
    );

    update();
})();

// Live Preview — During the Quiz
(function() {
    var prevCard = document.getElementById('iiqapt-prev-card');
    if (!prevCard || !document.querySelector('[name="iiqapt_during_show_progress"]')) return;

    var prevProgressWrap = document.getElementById('iiqapt-prev-progress-wrap');
    var prevProgressBar  = document.getElementById('iiqapt-prev-progress-bar');
    var prevCounter      = document.getElementById('iiqapt-prev-counter');
    var prevQuestion     = document.getElementById('iiqapt-prev-question');

    function update() {
        var showProg = document.querySelector('[name="iiqapt_during_show_progress"]');
        if (prevProgressWrap) prevProgressWrap.style.display = (showProg && showProg.checked) ? '' : 'none';

        if (prevProgressBar) prevProgressBar.style.background = iiqaptVal('iiqapt_during_progress_color', iiqaptPrimary);

        var showCtr = document.getElementById('iiqapt-counter-cb');
        var ctrFmt  = document.querySelector('[name="iiqapt_during_counter_format"]');
        if (prevCounter) {
            prevCounter.style.display    = (showCtr && showCtr.checked) ? '' : 'none';
            prevCounter.style.color      = iiqaptVal('iiqapt_during_counter_color',  '#6b7280');
            prevCounter.style.fontSize   = iiqaptVal('iiqapt_during_counter_size',   '13') + 'px';
            prevCounter.style.fontWeight = iiqaptVal('iiqapt_during_counter_weight', '400');
            if (ctrFmt) prevCounter.textContent = ctrFmt.value.replace('%n%','2').replace('%total%','5');
        }

        if (prevQuestion) {
            prevQuestion.style.textAlign  = iiqaptVal('iiqapt_during_question_align',  'center');
            prevQuestion.style.color      = iiqaptVal('iiqapt_during_question_color',  '#1f2937');
            prevQuestion.style.fontSize   = iiqaptVal('iiqapt_during_question_size',   '20') + 'px';
            prevQuestion.style.fontWeight = iiqaptVal('iiqapt_during_question_weight', '600');
        }

        var optColor    = iiqaptVal('iiqapt_during_option_color',                    '#000000');
        var selColor    = iiqaptVal('iiqapt_during_option_selected_color',          iiqaptPrimary);
        var selTxtColor = iiqaptVal('iiqapt_during_option_selected_text',           '#ffffff');
        var selSz       = iiqaptVal('iiqapt_during_option_selected_size',           '15');
        var selWt       = iiqaptVal('iiqapt_during_option_selected_weight',         '400');
        var selBdrC     = iiqaptVal('iiqapt_during_option_selected_border_color',   iiqaptPrimary);
        var selBdrW     = iiqaptVal('iiqapt_during_option_selected_border_width',   '2');
        var selBdrR     = iiqaptVal('iiqapt_during_option_selected_border_radius',  '12');
        var optBw       = iiqaptVal('iiqapt_during_option_border_width',            '2');
        var optRad      = iiqaptVal('iiqapt_during_option_border_radius',           '12');
        var optBc       = iiqaptVal('iiqapt_during_option_border_color',            '#e5e7eb');
        var optSz       = iiqaptVal('iiqapt_during_option_size',                    '15');
        var optWt       = iiqaptVal('iiqapt_during_option_weight',                  '400');
        var oAlign      = iiqaptVal('iiqapt_during_options_align',                  'center');
        document.querySelectorAll('.iiqapt-prev-option').forEach(function(o) {
            var isSel = o.classList.contains('iiqapt-prev-selected');
            o.style.textAlign = oAlign;
            if (isSel) {
                o.style.background   = selColor;
                o.style.color        = selTxtColor;
                o.style.fontSize     = selSz + 'px';
                o.style.fontWeight   = selWt;
                o.style.borderColor  = selBdrC;
                o.style.borderWidth  = selBdrW + 'px';
                o.style.borderRadius = selBdrR + 'px';
                o.style.borderStyle  = 'solid';
            } else {
                o.style.background   = '';
                o.style.color        = optColor;
                o.style.fontSize     = optSz + 'px';
                o.style.fontWeight   = optWt;
                o.style.borderColor  = optBc;
                o.style.borderWidth  = optBw + 'px';
                o.style.borderRadius = optRad + 'px';
                o.style.borderStyle  = 'solid';
            }
        });

        iiqaptApplyBox(prevCard, 'iiqapt_during');
    }

    iiqaptBind(
        '[name="iiqapt_during_show_progress"],[name="iiqapt_during_question_align"],' +
        '[name="iiqapt_during_question_color"],[name="iiqapt_during_question_size"],[name="iiqapt_during_question_weight"],' +
        '[name="iiqapt_during_options_align"],[name="iiqapt_during_counter_format"],' +
        '[name="iiqapt_during_counter_color"],[name="iiqapt_during_counter_size"],[name="iiqapt_during_counter_weight"],' +
        '[name="iiqapt_during_progress_color"],' +
        '[name="iiqapt_during_option_color"],[name="iiqapt_during_option_selected_color"],[name="iiqapt_during_option_selected_text"],' +
        '[name="iiqapt_during_option_selected_size"],[name="iiqapt_during_option_selected_weight"],' +
        '[name="iiqapt_during_option_selected_border_color"],[name="iiqapt_during_option_selected_border_width"],[name="iiqapt_during_option_selected_border_radius"],' +
        '[name="iiqapt_during_option_border_width"],[name="iiqapt_during_option_border_radius"],[name="iiqapt_during_option_border_color"],' +
        '[name="iiqapt_during_option_size"],[name="iiqapt_during_option_weight"],' +
        '[name="iiqapt_during_box_bg"],[name="iiqapt_during_box_border_radius"],' +
        '[name="iiqapt_during_box_border_width"],[name="iiqapt_during_box_border_color"],[name="iiqapt_during_box_shadow"]',
        update
    );
    var ctrCb = document.getElementById('iiqapt-counter-cb');
    if (ctrCb) ctrCb.addEventListener('change', update);

    // Dyslexic toggle visibility, label, and interactive font switching
    var prevDyslexicToggle = document.getElementById('iiqapt-prev-dyslexic-toggle');
    if (prevDyslexicToggle) {
        var dyslexicActive = false;
        function updateDyslexic() {
            var enabledCb  = document.querySelector('[name="iiqapt_during_dyslexic_enabled"]');
            var labelOffIn = document.querySelector('[name="iiqapt_during_dyslexic_off"]');
            var labelOnIn  = document.querySelector('[name="iiqapt_during_dyslexic_on"]');
            var labelOff   = (labelOffIn && labelOffIn.value.trim()) ? labelOffIn.value : 'Change to dyslexia friendly font';
            var labelOn    = (labelOnIn  && labelOnIn.value.trim())  ? labelOnIn.value  : 'Change to regular font';
            var dysEnabled = enabledCb && enabledCb.checked;
            if (enabledCb) prevDyslexicToggle.style.display = dysEnabled ? '' : 'none';
            if (prevProgressWrap) prevProgressWrap.style.marginTop = dysEnabled ? '28px' : '0';
            prevDyslexicToggle.textContent = dyslexicActive ? labelOn : labelOff;
            prevDyslexicToggle.style.color        = iiqaptVal('iiqapt_during_dyslexic_color',         '#6b7280');
            prevDyslexicToggle.style.background   = iiqaptVal('iiqapt_during_dyslexic_bg',            '#ffffff');
            prevDyslexicToggle.style.fontSize     = iiqaptVal('iiqapt_during_dyslexic_size',          '11') + 'px';
            var bdw = iiqaptVal('iiqapt_during_dyslexic_border_width',  '1');
            var bdc = iiqaptVal('iiqapt_during_dyslexic_border_color',  '#e5e7eb');
            var bdr = iiqaptVal('iiqapt_during_dyslexic_border_radius', '20');
            prevDyslexicToggle.style.border       = parseInt(bdw) > 0 ? bdw + 'px solid ' + bdc : 'none';
            prevDyslexicToggle.style.borderRadius = bdr + 'px';
        }
        prevDyslexicToggle.addEventListener('click', function() {
            dyslexicActive = !dyslexicActive;
            prevCard.classList.toggle('iiqapt-dyslexic', dyslexicActive);
            updateDyslexic();
        });
        iiqaptBind(
            '[name="iiqapt_during_dyslexic_enabled"],[name="iiqapt_during_dyslexic_off"],[name="iiqapt_during_dyslexic_on"],' +
            '[name="iiqapt_during_dyslexic_color"],[name="iiqapt_during_dyslexic_bg"],[name="iiqapt_during_dyslexic_size"],' +
            '[name="iiqapt_during_dyslexic_border_width"],[name="iiqapt_during_dyslexic_border_color"],[name="iiqapt_during_dyslexic_border_radius"]',
            updateDyslexic
        );
        updateDyslexic();
    }

    update();
})();

// Live Preview — After the Quiz
(function() {
    var prevCard          = document.getElementById('iiqapt-prev-card');
    var prevResultLevel   = document.getElementById('iiqapt-prev-result-level');
    if (!prevResultLevel) return;
    var prevScaleBar      = document.getElementById('iiqapt-prev-scale-bar');
    var prevErrorMargin   = document.getElementById('iiqapt-prev-error-margin');
    var prevActiveLabel   = document.getElementById('iiqapt-prev-active-label');
    var prevRetake        = document.getElementById('iiqapt-prev-retake');
    var prevAfterTitle    = document.getElementById('iiqapt-prev-after-title');
    var prevAfterSub      = document.getElementById('iiqapt-prev-after-subheading');
    var prevAfterBody     = document.getElementById('iiqapt-prev-after-body');

    function update() {
        // Title content + styling
        var titleEl = document.getElementById('iiqapt-after-title');
        if (titleEl && prevAfterTitle) prevAfterTitle.textContent = titleEl.value;
        if (prevAfterTitle) {
            prevAfterTitle.style.color      = iiqaptVal('iiqapt_after_title_color',  '#1f2937');
            prevAfterTitle.style.fontSize   = iiqaptVal('iiqapt_after_title_size',   '24') + 'px';
            prevAfterTitle.style.fontWeight = iiqaptVal('iiqapt_after_title_weight', '700');
        }
        // Subheading content + styling
        var subEl = document.getElementById('iiqapt-after-subheading');
        if (subEl && prevAfterSub) prevAfterSub.textContent = subEl.value;
        if (prevAfterSub) {
            prevAfterSub.style.color      = iiqaptVal('iiqapt_after_subheading_color',  '#6b7280');
            prevAfterSub.style.fontSize   = iiqaptVal('iiqapt_after_subheading_size',   '16') + 'px';
            prevAfterSub.style.fontWeight = iiqaptVal('iiqapt_after_subheading_weight', '400');
        }
        // Body content + styling
        var bodyEl = document.getElementById('iiqapt-after-body');
        if (bodyEl && prevAfterBody) prevAfterBody.textContent = bodyEl.value;
        if (prevAfterBody) {
            prevAfterBody.style.color      = iiqaptVal('iiqapt_after_body_color',  '#6b7280');
            prevAfterBody.style.fontSize   = iiqaptVal('iiqapt_after_body_size',   '14') + 'px';
            prevAfterBody.style.fontWeight = iiqaptVal('iiqapt_after_body_weight', '400');
        }

        var resultColor = iiqaptVal('iiqapt_after_result_color', iiqaptPrimary);
        prevResultLevel.style.color      = resultColor;
        prevResultLevel.style.fontSize   = iiqaptVal('iiqapt_after_result_size',   '64') + 'px';
        prevResultLevel.style.fontWeight = iiqaptVal('iiqapt_after_result_weight', '700');
        if (prevScaleBar) {
            var showErrRate = iiqaptChecked('iiqapt_show_error_rate');
            prevScaleBar.style.display = showErrRate ? '' : 'none';
            if (showErrRate) {
                prevScaleBar.style.background = resultColor;
                var errRate  = 12; // preview uses a realistic example; actual value is computed by the test
                var indWidth = Math.max(5, errRate * 2);
                var leftPos  = 50 - (indWidth / 2);
                prevScaleBar.style.width = indWidth + '%';
                prevScaleBar.style.left  = leftPos  + '%';
            }
        }
        if (prevErrorMargin) {
            var showErrRate2 = iiqaptChecked('iiqapt_show_error_rate');
            prevErrorMargin.style.display = showErrRate2 ? '' : 'none';
            if (showErrRate2) {
                var labelEl  = document.getElementById('iiqapt-error-rate-label');
                var rawLabel = (labelEl && labelEl.value.trim()) ? labelEl.value : 'Margin of Error: ±{rate}%';
                var errRate2 = 12; // preview uses a realistic example; actual value is computed by the test
                prevErrorMargin.textContent = rawLabel.replace('{rate}', errRate2);
            }
        }
        if (prevActiveLabel) prevActiveLabel.style.color   = resultColor;

        if (prevRetake) {
            prevRetake.style.background   = iiqaptVal('iiqapt_after_retake_color',         iiqaptPrimary);
            prevRetake.style.color        = iiqaptVal('iiqapt_after_retake_text_color',     '#ffffff');
            prevRetake.style.fontSize     = iiqaptVal('iiqapt_after_retake_size',           '16') + 'px';
            prevRetake.style.fontWeight   = iiqaptVal('iiqapt_after_retake_weight',         '600');
            prevRetake.style.borderColor  = iiqaptVal('iiqapt_after_retake_border_color',   iiqaptPrimary);
            prevRetake.style.borderWidth  = iiqaptVal('iiqapt_after_retake_border_width',   '2') + 'px';
            prevRetake.style.borderRadius = iiqaptVal('iiqapt_after_retake_border_radius',  '8') + 'px';
            prevRetake.style.borderStyle  = 'solid';
        }

        if (prevCard) iiqaptApplyBox(prevCard, 'iiqapt_after');
    }

    ['iiqapt-after-title','iiqapt-after-subheading','iiqapt-after-body'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', update);
    });
    var errLabelEl = document.getElementById('iiqapt-error-rate-label');
    if (errLabelEl) errLabelEl.addEventListener('input', update);
    iiqaptBind(
        '[name="iiqapt_show_error_rate"],' +
        '[name="iiqapt_after_title_color"],[name="iiqapt_after_title_size"],[name="iiqapt_after_title_weight"],' +
        '[name="iiqapt_after_subheading_color"],[name="iiqapt_after_subheading_size"],[name="iiqapt_after_subheading_weight"],' +
        '[name="iiqapt_after_body_color"],[name="iiqapt_after_body_size"],[name="iiqapt_after_body_weight"],' +
        '[name="iiqapt_after_result_color"],[name="iiqapt_after_result_size"],[name="iiqapt_after_result_weight"],' +
        '[name="iiqapt_after_retake_color"],[name="iiqapt_after_retake_text_color"],[name="iiqapt_after_retake_size"],[name="iiqapt_after_retake_weight"],' +
        '[name="iiqapt_after_retake_border_color"],[name="iiqapt_after_retake_border_width"],[name="iiqapt_after_retake_border_radius"],' +
        '[name="iiqapt_after_box_bg"],[name="iiqapt_after_box_text_color"],[name="iiqapt_after_box_border_radius"],' +
        '[name="iiqapt_after_box_border_width"],[name="iiqapt_after_box_border_color"],[name="iiqapt_after_box_shadow"]',
        update
    );

    update();
})();
