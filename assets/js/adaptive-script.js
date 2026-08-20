/**
 * Adaptive Level Test Logic
 * Handles UI interactions for option selection and progress updates.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    const AdaptiveLevelQuiz = {
        // DOM Elements
        elements: {
            appContainer:      document.getElementById('adaptive-app'),
            optionsContainer:  document.getElementById('esl-options-container'),
            progressContainer:  document.getElementById('esl-progress-container'),
            progressBar:        document.getElementById('esl-progress-bar'),
            counterEl:         document.getElementById('esl-counter'),
            nextBtn:           document.getElementById('esl-next-btn'),
            questionText:      document.getElementById('esl-question-text'),
            emailCapture:      document.getElementById('esl-email-capture'),
            quizInterface:     document.getElementById('esl-quiz-interface'),
            startBtn:          document.getElementById('esl-start-btn'),
            emailInput:        document.getElementById('esl-test-email'),
            emailError:        document.getElementById('esl-email-error')
        },

        // Settings read from data attributes
        settings: {},

        // Internal State
        state: {
            currentProgress: 0,
            selectedOptionId: null,
            questions: [],
            currentIndex: 0,
            answers: {},
            batchNumber: 1,
            bankId: 1,
            shownIds: [],    // IDs of every question seen — prevents repeats
            answerLog: [],   // [{n, id, chosen, ms}] across all batches — for student report
            questionCount: 0,
            startedAt: null,          // ms timestamp when first question rendered
            questionStartedAt: null   // ms timestamp when current question rendered
        },

        /**
         * Initialize the quiz interface
         */
        init: function() {
            if (!this.elements.optionsContainer) return;
            const card = this.elements.appContainer;
            if (card) {
                this.state.bankId = card.dataset.bankId || 1;
                this.settings = {
                    showProgress:  card.dataset.showProgress  !== '0',
                    showCounter:   card.dataset.showCounter   === '1',
                    counterFormat: card.dataset.counterFormat || 'Question %n% of %total%',
                    questionAlign: card.dataset.questionAlign || 'center',
                    optionsAlign:  card.dataset.optionsAlign  || 'left',
                };
            }
            if (!this.settings.showProgress && this.elements.progressContainer) {
                this.elements.progressContainer.style.display = 'none';
            }
            if (this.elements.questionText) {
                this.elements.questionText.style.textAlign = this.settings.questionAlign || 'center';
            }
            this.initDyslexicToggle();
            this.bindEvents();
        },

        initDyslexicToggle: function() {
            const toggle  = document.getElementById('esl-dyslexic-toggle');
            const wrapper = this.elements.appContainer
                ? this.elements.appContainer.closest('.adaptive-wrapper')
                : null;
            if (!toggle || !wrapper) return;

            const i18n     = (typeof adaptive_test_ajax !== 'undefined' && adaptive_test_ajax.i18n) ? adaptive_test_ajax.i18n : {};
            const labelOn  = i18n.dyslexic_on  || 'Change to regular font';
            const labelOff = i18n.dyslexic_off || 'Change to dyslexia friendly font';

            // Restore preference from localStorage
            if (localStorage.getItem('esl_dyslexic') === '1') {
                wrapper.classList.add('esl-dyslexic');
                toggle.classList.add('active');
                toggle.setAttribute('aria-pressed', 'true');
                toggle.textContent = labelOn;
            }

            toggle.addEventListener('click', function() {
                const on = wrapper.classList.toggle('esl-dyslexic');
                toggle.classList.toggle('active', on);
                toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
                toggle.textContent = on ? labelOn : labelOff;
                localStorage.setItem('esl_dyslexic', on ? '1' : '0');
            });
        },

        /**
         * Bind click events to UI elements
         */
        bindEvents: function() {
            // Event Delegation for Option Buttons
            this.elements.optionsContainer.addEventListener('click', (e) => {
                // Check for Retake button first
                if (e.target.closest('#esl-retake-btn')) {
                    this.resetTest();
                    return;
                }

                // Traverse up to find the button if clicking on an internal element
                const button = e.target.closest('.adaptive-option-btn');
                
                // Ensure we clicked a button and it's not the Next button (if nested)
                if (button && button.id !== 'esl-next-btn') {
                    this.handleOptionSelect(button);
                }
            });

            // Next Button Interaction
            if (this.elements.nextBtn) {
                this.elements.nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleNextQuestion();
                });
            }

            // Start Button Interaction
            if (this.elements.startBtn) {
                this.elements.startBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleStart();
                });
            }
        },

        /**
         * Handle visual selection of an option
         */
        handleOptionSelect: function(selectedButton) {
            // 1. Remove 'selected' class from all sibling options
            const allOptions = this.elements.optionsContainer.querySelectorAll('.adaptive-option-btn');
            allOptions.forEach(btn => btn.classList.remove('selected'));
            
            // 2. Add 'selected' class to the clicked button
            selectedButton.classList.add('selected');

            // 3. Update internal state
            this.state.selectedOptionId = selectedButton.dataset.id || null;

            // 4. Auto-advance after a short delay
            this.elements.optionsContainer.style.pointerEvents = 'none'; // Prevent double clicks
            setTimeout(() => {
                this.handleNextQuestion();
                this.elements.optionsContainer.style.pointerEvents = 'auto';
            }, 400);
        },

        /**
         * Handle Next Button Click
         * Advances to next question or submits batch if finished.
         */
        handleNextQuestion: function() {
            const currentQuestion = this.state.questions[this.state.currentIndex];

            // Save the answer (using the text value stored in dataset.id)
            if (this.state.selectedOptionId) {
                this.state.answers[`question_${currentQuestion.id}`] = this.state.selectedOptionId;
            }

            // Log for student report
            this.state.questionCount++;
            this.state.answerLog.push({
                n:      this.state.questionCount,
                id:     currentQuestion.id,
                chosen: this.state.selectedOptionId || '',
                ms:     Date.now() - (this.state.questionStartedAt || Date.now())
            });

            // Check if we are at the end of the batch
            if (this.state.currentIndex < this.state.questions.length - 1) {
                this.state.currentIndex++;
                this.renderQuestion();
            } else {
                // Batch finished
                this.submitBatch();
            }
        },

        /**
         * Safely render an error message into the options container.
         */
        showError: function(message) {
            const div = document.createElement('div');
            div.style.cssText = 'text-align:center; color: #dc2626; padding: 20px;';
            div.textContent = message;
            this.elements.optionsContainer.innerHTML = '';
            this.elements.optionsContainer.appendChild(div);
        },

        setCardState: function(state) {
            const card = this.elements.appContainer;
            if (!card) return;
            card.classList.remove('esl-state-before', 'esl-state-during', 'esl-state-after');
            card.classList.add('esl-state-' + state);
        },

        /**
         * Handle Start Button Click
         * Validates email and switches to quiz view.
         */
        handleStart: function() {
            const email = this.elements.emailInput ? this.elements.emailInput.value.trim() : '';

            if (!email || !email.includes('@')) {
                if (this.elements.emailError) {
                    this.elements.emailError.textContent = adaptive_test_ajax.i18n.valid_email;
                    this.elements.emailError.style.display = 'block';
                }
                if (this.elements.emailInput) {
                    this.elements.emailInput.focus();
                }
                return;
            }
            if (this.elements.emailError) {
                this.elements.emailError.style.display = 'none';
            }

            if (this.elements.emailCapture) {
                this.elements.emailCapture.classList.add('adaptive-hidden');
            }
            if (this.elements.quizInterface) {
                this.elements.quizInterface.classList.remove('adaptive-hidden');
            }
            this.setCardState('during');
            this.startTest();
        },

        /**
         * Reset the test to initial state
         */
        resetTest: function() {
            this.state.currentProgress = 0;
            this.state.selectedOptionId = null;
            this.state.questions = [];
            this.state.currentIndex = 0;
            this.state.answers = {};
            this.state.batchNumber = 1;
            this.state.shownIds = [];
            this.state.answerLog = [];
            this.state.questionCount = 0;
            this.state.startedAt = null;
            this.state.questionStartedAt = null;

            this.updateProgressBar(0);
            this.elements.questionText.style.cssText = '';
            this.elements.questionText.textContent = adaptive_test_ajax.i18n.loading || 'Loading...';
            this.elements.optionsContainer.innerHTML = '';
            if (this.elements.counterEl) { this.elements.counterEl.style.display = 'none'; }

            if (this.elements.quizInterface) this.elements.quizInterface.classList.add('adaptive-hidden');
            if (this.elements.emailCapture) this.elements.emailCapture.classList.remove('adaptive-hidden');
            this.setCardState('before');
        },

        /**
         * Fetch the initial batch of questions from the server
         */
        startTest: function() {
            // Ensure global ajax object exists
            if (typeof adaptive_test_ajax === 'undefined') {
                console.error('Adaptive Level Test: AJAX configuration missing.');
                return;
            }

            const formData = new FormData();
            formData.append('action', 'adaptive_test_start_test');
            formData.append('nonce', adaptive_test_ajax.nonce);
            formData.append('bank_id', this.state.bankId);
            const hp = document.getElementById('esl-hp-url');
            if (hp) formData.append('esl_hp', hp.value);

            fetch(adaptive_test_ajax.ajax_url, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(response => {
                if (response.success && response.data.questions) {
                    this.state.questions = response.data.questions;
                    this.state.currentIndex = 0;
                    this.state.batchNumber = 1;
                    this.state.shownIds = response.data.questions.map(q => q.id);
                    this.renderQuestion();
                } else {
                    const msg = response.data || adaptive_test_ajax.i18n.unknown_error;
                    this.elements.questionText.textContent = adaptive_test_ajax.i18n.error_loading;
                    this.showError(msg);
                    console.error('API Error:', response);
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                this.elements.questionText.textContent = adaptive_test_ajax.i18n.connection_error;
                this.showError(error.message + '. ' + adaptive_test_ajax.i18n.refresh_retry);
            });
        },

        /**
         * Submit the current batch of answers
         */
        submitBatch: function() {
            // Notify add-ons that a batch is being analysed (Pro renders an overlay here)
            this.dispatch('analysing-start', { card: this.elements.appContainer, batchNumber: this.state.batchNumber });
            if (this.elements.counterEl) { this.elements.counterEl.style.display = 'none'; }
            if (this.elements.nextBtn)   { this.elements.nextBtn.classList.add('adaptive-hidden'); }

            const formData = new FormData();
            formData.append('action', 'adaptive_test_submit_answers');
            formData.append('nonce', adaptive_test_ajax.nonce);
            formData.append('batch_number', this.state.batchNumber);
            formData.append('bank_id', this.state.bankId);
            formData.append('shown_ids', JSON.stringify(this.state.shownIds));
            formData.append('answer_log', JSON.stringify(this.state.answerLog));
            formData.append('duration_seconds', Math.round((Date.now() - (this.state.startedAt || Date.now())) / 1000));

            // Append answers
            for (const [key, value] of Object.entries(this.state.answers)) {
                formData.append(key, value);
            }

            // Attempt to capture email from the initial form if present in DOM
            const emailInput = document.getElementById('esl-test-email');
            if (emailInput && emailInput.value) {
                formData.append('email', emailInput.value);
            }

            fetch(adaptive_test_ajax.ajax_url, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(response => {
                if (response.success) {
                    const targetError = parseFloat(adaptive_test_ajax.target_error) || 8;
                    if (response.data.finished) {
                        this.dispatch('analysing-update', { card: this.elements.appContainer, errorRate: targetError, targetError: targetError, finished: true });
                        this.renderResults(response.data.level, response.data.theta, response.data.error_rate);
                        this.dispatch('analysing-end', { card: this.elements.appContainer, finished: true });
                    } else {
                        this.dispatch('analysing-update', { card: this.elements.appContainer, errorRate: response.data.error_rate, targetError: targetError, finished: false });
                        this.state.questions = response.data.questions;
                        this.state.currentIndex = 0;
                        this.state.answers = {};
                        this.state.batchNumber++;
                        const newIds = response.data.questions.map(q => q.id);
                        this.state.shownIds = response.data.pool_reset
                            ? newIds
                            : this.state.shownIds.concat(newIds);
                        this.renderQuestion();
                        this.dispatch('analysing-end', { card: this.elements.appContainer, finished: false });
                    }
                } else {
                    const msg = response.data || adaptive_test_ajax.i18n.unknown_error;
                    this.elements.questionText.textContent = adaptive_test_ajax.i18n.error_submitting;
                    this.showError(msg);
                }
            })
            .catch(error => {
                console.error('Submission Error:', error);
                this.showError(error.message + '. ' + adaptive_test_ajax.i18n.retry);
            });
        },

        renderResults: function(level, theta, dynamicErrorRate) {
            const levels = ['A2', 'B1', 'B2', 'C1', 'C2'];
            // Validate level against known values before any DOM insertion
            if (!levels.includes(level)) {
                this.showError(adaptive_test_ajax.i18n.unknown_error);
                return;
            }
            const levelIndex    = levels.indexOf(level);
            const showErrorRate = !!adaptive_test_ajax.show_error_rate;
            const errorRate     = dynamicErrorRate != null ? dynamicErrorRate : 0;

            // Calculate scale visuals
            let scaleHtml = '<div class="esl-result-scale-container"><div class="esl-result-scale">';

            // Segments
            levels.forEach(lvl => {
                const isActive = lvl === level ? 'active' : '';
                scaleHtml += `<div class="esl-scale-segment ${isActive}"><span class="esl-scale-label">${lvl}</span></div>`;
            });

            if (showErrorRate) {
                // Each segment occupies 20% of the bar; segment centres are at 10%, 30%, 50%, 70%, 90%.
                // Theta (logit scale −2..+2) maps linearly to these centre positions.
                // The indicator is clamped to stay within the active level's segment.
                const levelCentre = levelIndex * 20 + 10;
                const thetaPos    = (theta != null) ? (theta + 2) / 4 * 80 + 10 : levelCentre;
                const halfSeg     = 10; // half of one 20%-wide segment
                const centerPos   = Math.max(levelCentre - halfSeg, Math.min(levelCentre + halfSeg, thetaPos));
                const indicatorWidth = Math.max(5, errorRate * 2);
                const leftPos     = Math.max(0, Math.min(100 - indicatorWidth, centerPos - indicatorWidth / 2));
                scaleHtml += `<div class="esl-scale-indicator" style="left: ${leftPos}%; width: ${indicatorWidth}%;"></div>`;
            }
            scaleHtml += '</div></div>';

            const titleColor      = adaptive_test_ajax.after_title_color      || '#1f2937';
            const titleSize       = (adaptive_test_ajax.after_title_size      || 24) + 'px';
            const titleWeight     = adaptive_test_ajax.after_title_weight     || '700';
            const subColor        = adaptive_test_ajax.after_subheading_color || '#6b7280';
            const subSize         = (adaptive_test_ajax.after_subheading_size || 16) + 'px';
            const subWeight       = adaptive_test_ajax.after_subheading_weight|| '400';
            const bodyColor       = adaptive_test_ajax.after_body_color       || '#6b7280';
            const bodySize        = (adaptive_test_ajax.after_body_size       || 14) + 'px';
            const bodyWeight      = adaptive_test_ajax.after_body_weight      || '400';
            const resultColor     = adaptive_test_ajax.result_color      || 'var(--esl-primary)';
            const resultSize      = (adaptive_test_ajax.result_size      || 64) + 'px';
            const resultWeight    = adaptive_test_ajax.result_weight     || '700';
            const retakeColor        = adaptive_test_ajax.retake_color        || resultColor;
            const retakeTextColor    = adaptive_test_ajax.retake_text_color    || '#fff';
            const retakeSize         = (adaptive_test_ajax.retake_size         || 16) + 'px';
            const retakeWeight       = adaptive_test_ajax.retake_weight        || '600';
            const retakeBorderColor  = adaptive_test_ajax.retake_border_color  || retakeColor;
            const retakeBorderWidth  = (adaptive_test_ajax.retake_border_width  ?? 2) + 'px';
            const retakeBorderRadius = (adaptive_test_ajax.retake_border_radius ?? 8) + 'px';

            const i18n = adaptive_test_ajax.i18n || {};

            this.setCardState('after');
            this.elements.questionText.style.color      = titleColor;
            this.elements.questionText.style.fontSize   = titleSize;
            this.elements.questionText.style.fontWeight = titleWeight;
            this.elements.questionText.innerHTML = i18n.test_complete;
            this.elements.optionsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p id="esl-result-label" style="color: ${subColor}; font-size: ${subSize}; font-weight: ${subWeight}; margin: 0 0 4px;"></p>
                    <h1 id="esl-result-level" style="font-size: ${resultSize}; font-weight: ${resultWeight}; color: ${resultColor}; margin: 10px 0;"></h1>
                    ${scaleHtml}
                    ${showErrorRate ? '<p id="esl-result-margin" style="font-size: 0.9rem; color: var(--esl-text-muted); margin-top: 10px;"></p>' : ''}
                    <p id="esl-result-email" style="color: ${bodyColor}; font-size: ${bodySize}; font-weight: ${bodyWeight}; margin: 0 0 16px;"></p>
                    <button type="button" id="esl-retake-btn" class="adaptive-option-btn" style="margin-top: 24px; width: auto; display: inline-block; background-color: ${retakeColor}; color: ${retakeTextColor}; font-size: ${retakeSize}; font-weight: ${retakeWeight}; border: ${retakeBorderWidth} solid ${retakeBorderColor}; border-radius: ${retakeBorderRadius};"></button>
                </div>
            `;
            // Set content safely after building structure
            document.getElementById('esl-result-label').innerHTML = i18n.estimated_level;
            document.getElementById('esl-result-level').textContent = level;
            if (showErrorRate) {
                const rawLabel = adaptive_test_ajax.error_rate_label || 'Margin of Error: ±{rate}%';
                document.getElementById('esl-result-margin').innerHTML = rawLabel.replace('{rate}', errorRate);
            }

            document.getElementById('esl-result-email').innerHTML = i18n.email_sent;
            document.getElementById('esl-retake-btn').textContent = i18n.retake_test;

            this.updateProgressBar(100);

            // Notify add-ons that the results screen has been rendered (Pro adds share buttons here)
            this.dispatch('results', {
                card:         this.elements.appContainer,
                container:    this.elements.optionsContainer,
                retakeButton: document.getElementById('esl-retake-btn'),
                level:        level,
                theta:        theta,
                errorRate:    errorRate
            });
        },

        /**
         * Render the current question to the DOM
         */
        renderQuestion: function() {
            const question = this.state.questions[this.state.currentIndex];
            if (!question) return;

            // Track timing
            if (this.state.startedAt === null) { this.state.startedAt = Date.now(); }
            this.state.questionStartedAt = Date.now();

            // 1. Update Question Text
            this.elements.questionText.textContent = question.question_text;

            // 2. Clear existing options
            this.elements.optionsContainer.innerHTML = '';

            // 3. Parse options (DB stores them as JSON string)
            let options = [];
            try {
                options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
            } catch (e) {
                console.error('Error parsing options', e);
            }

            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

            // 4. Create Option Buttons
            options.forEach(optionText => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'adaptive-option-btn';
                btn.textContent = optionText;
                btn.dataset.id = optionText;
                btn.style.textAlign = this.settings.optionsAlign || 'left';
                this.elements.optionsContainer.appendChild(btn);
            });

            // 5. Update question counter
            if (this.settings.showCounter && this.elements.counterEl) {
                const n     = this.state.currentIndex + 1;
                const total = this.state.questions.length;
                this.elements.counterEl.textContent = (this.settings.counterFormat || 'Question %n% of %total%')
                    .replace('%n%', n).replace('%total%', total);
                this.elements.counterEl.style.display = '';
            }

            // 6. Reset UI state for new question
            if (this.elements.nextBtn) {
                this.elements.nextBtn.classList.add('adaptive-hidden');
            }
            this.state.selectedOptionId = null;

            // 7. Update Progress Bar (Simple calculation based on batch size of 5)
            const progress = ((this.state.currentIndex) / 5) * 100;
            this.updateProgressBar(progress);
        },

        /**
         * Update the progress bar width
         * @param {number} percentage - Value between 0 and 100
         */
        updateProgressBar: function(percentage) {
            // Clamp percentage between 0 and 100
            const validPercentage = Math.max(0, Math.min(100, percentage));
            this.state.currentProgress = validPercentage;

            if (this.elements.progressBar) {
                this.elements.progressBar.style.width = `${validPercentage}%`;
            }
        },

        /**
         * Dispatch a namespaced CustomEvent on document so add-ons (e.g. Pro)
         * can hook into the quiz lifecycle (batch transitions, results screen).
         */
        dispatch: function(name, detail) {
            document.dispatchEvent(new CustomEvent('adaptive_test:' + name, { detail: detail || {} }));
        }
    };

    // Start the application
    AdaptiveLevelQuiz.init();
    
    // Expose to global scope if needed for AJAX callbacks later
    window.AdaptiveLevelQuiz = AdaptiveLevelQuiz;
});