document.addEventListener('DOMContentLoaded', () => {
    // Main Calculator Object
    const Calculator = {
        // Configuration constants
        config: {
            exchangeRate: 3.80, // 1 USD = 3.80 PLN
            baseRatePerMinute: 70, // This will be ignored for fixed-price formats
            videoFormats: {
                quick_reel: { name: "Błyskawiczny Reel", length: 1, fixedPrice: 300 },
                standard_reel: { name: "Reel Standardowy", length: 2, fixedPrice: 450 },
                short_film: { name: "Krótki Film", length: 5.5, fixedPrice: 550 },
                full_film: { name: "Film Pełnometrażowy", length: 10 },
                extended_film: { name: "Film Rozbudowany", length: 15.5 }
            },
            collaborationMultipliers: {
                onetime: 1.0,    // No change
                multiple: 1.1,   // +10% despite UI showing -10%
                regular: 1.2     // +20% despite UI showing -20%
            },
            complexityMultipliers: {
                basic: 1.0,      // Base level
                advanced: 1.25,  // +25%
                premium: 1.7     // +70%
            },
            additionalServices: {
                youtube: { price: 750, name: "Zarządzanie YouTube", perMonth: true }, // 750 PLN/month
                consulting: { price: 500, name: "Konsulting wideo", perMonth: true }, // 500 PLN/month
                thumbnails: { price: 100, name: "Miniaturki", perMonth: false } // 100 PLN/piece
            }
        },
        
        // State variables
        state: {
            currency: "PLN",
            collaboration: "onetime",
            formats: [],
            formatQuantities: {
                quick_reel: 1,
                standard_reel: 1,
                short_film: 1,
                full_film: 1,
                extended_film: 1
            },
            serviceQuantities: {
                youtube: 1,
                consulting: 1,
                thumbnails: 1
            },
            customFormat: {
                quantity: 1,
                length: 5
            },
            complexity: "basic",
            additionalServices: [],
            currentStep: 1,
            totalCost: 0
        },
        
        // DOM elements
        elements: {},
        
        // Initialize the calculator
        init() {
            this.cacheElements();
            this.bindEvents();
            this.updateProgressBar();
            this.createQuantityInputs();
            this.createServiceQuantityInputs();
            this.updateSummary();
            
            // Hide mobile summary by default - only show at the end
            if (this.elements.calculatorSummaryMobile) {
                this.elements.calculatorSummaryMobile.style.display = 'none';
            }
            
            // Show first step
            this.goToStep(1);
        },
        
        // Create quantity inputs for each format
        createQuantityInputs() {
            if (this.elements.formatCheckboxes) {
                this.elements.formatCheckboxes.forEach(checkbox => {
                    if (checkbox.value !== 'custom') {
                        const formatContainer = checkbox.closest('.checkbox-option');
                        if (formatContainer) {
                            // Create quantity input container
                            const quantityContainer = document.createElement('div');
                            quantityContainer.className = 'quantity-container';
                            quantityContainer.style.display = 'none';
                            
                            // Create label
                            const label = document.createElement('label');
                            label.textContent = 'Ilość:';
                            label.className = 'quantity-label';
                            
                            // Create controls container
                            const controls = document.createElement('div');
                            controls.className = 'quantity-controls';
                            
                            // Create decrement button
                            const decrementBtn = document.createElement('button');
                            decrementBtn.type = 'button';
                            decrementBtn.className = 'quantity-btn';
                            decrementBtn.textContent = '−';
                            decrementBtn.setAttribute('aria-label', 'Zmniejsz ilość');
                            
                            // Create input
                            const input = document.createElement('input');
                            input.type = 'number';
                            input.min = '1';
                            input.max = '100';
                            input.value = '1';
                            input.className = 'quantity-input';
                            input.dataset.format = checkbox.value;
                            
                            // Create increment button
                            const incrementBtn = document.createElement('button');
                            incrementBtn.type = 'button';
                            incrementBtn.className = 'quantity-btn';
                            incrementBtn.textContent = '+';
                            incrementBtn.setAttribute('aria-label', 'Zwiększ ilość');
                            
                            // Add event listeners
                            decrementBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentValue = parseInt(input.value) || 1;
                                const newValue = Math.max(1, currentValue - 1);
                                input.value = newValue;
                                this.updateFormatQuantity(checkbox.value, newValue);
                            });
                            
                            incrementBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentValue = parseInt(input.value) || 1;
                                const newValue = Math.min(100, currentValue + 1);
                                input.value = newValue;
                                this.updateFormatQuantity(checkbox.value, newValue);
                            });
                            
                            input.addEventListener('input', (e) => {
                                e.stopPropagation();
                                let value = parseInt(input.value) || 1;
                                value = Math.max(1, Math.min(100, value));
                                input.value = value;
                                this.updateFormatQuantity(checkbox.value, value);
                            });
                            
                            input.addEventListener('blur', (e) => {
                                e.stopPropagation();
                                if (!input.value || input.value === '0') {
                                    input.value = '1';
                                    this.updateFormatQuantity(checkbox.value, 1);
                                }
                            });
                            
                            input.addEventListener('click', (e) => {
                                e.stopPropagation();
                            });
                            
                            // Add elements to controls
                            controls.appendChild(decrementBtn);
                            controls.appendChild(input);
                            controls.appendChild(incrementBtn);
                            
                            // Add elements to container
                            quantityContainer.appendChild(label);
                            quantityContainer.appendChild(controls);
                            
                            // Add container after checkbox label
                            formatContainer.appendChild(quantityContainer);
                            
                            // Store reference to quantity input
                            if (!this.elements.formatQuantityInputs) {
                                this.elements.formatQuantityInputs = {};
                            }
                            this.elements.formatQuantityInputs[checkbox.value] = input;
                        }
                    }
                });

                // Adjust checkbox event listeners to show/hide quantity inputs
                this.elements.formatCheckboxes.forEach(checkbox => {
                    if (checkbox.value !== 'custom') {
                        checkbox.addEventListener('change', () => {
                            const formatContainer = checkbox.closest('.checkbox-option');
                            if (formatContainer) {
                                const quantityContainer = formatContainer.querySelector('.quantity-container');
                                if (quantityContainer) {
                                    if (checkbox.checked) {
                                        quantityContainer.style.display = 'flex';
                                        setTimeout(() => {
                                            quantityContainer.style.opacity = '1';
                                            quantityContainer.style.transform = 'translateY(0)';
                                        }, 0);
                                    } else {
                                        quantityContainer.style.opacity = '0';
                                        quantityContainer.style.transform = 'translateY(-10px)';
                                        setTimeout(() => {
                                            quantityContainer.style.display = 'none';
                                        }, 300);
                                    }
                                }
                            }
                            this.updateFormat(checkbox.value, checkbox.checked);
                        });
                    }
                });
            }
        },
        
        // Create quantity inputs for additional services
        createServiceQuantityInputs() {
            if (this.elements.additionalServicesCheckboxes) {
                this.elements.additionalServicesCheckboxes.forEach(checkbox => {
                    const serviceContainer = checkbox.closest('.checkbox-option');
                    if (serviceContainer) {
                        // Create quantity input container
                        const quantityContainer = document.createElement('div');
                        quantityContainer.className = 'quantity-container';
                        quantityContainer.style.display = 'none';
                        
                        // Create label
                        const label = document.createElement('label');
                        const serviceConfig = this.config.additionalServices[checkbox.value];
                        label.textContent = serviceConfig.perMonth ? 'Liczba miesięcy:' : 'Ilość:';
                        label.className = 'quantity-label';
                        
                        // Create controls container
                        const controls = document.createElement('div');
                        controls.className = 'quantity-controls';
                        
                        // Create decrement button
                        const decrementBtn = document.createElement('button');
                        decrementBtn.type = 'button';
                        decrementBtn.className = 'quantity-btn';
                        decrementBtn.textContent = '−';
                        decrementBtn.setAttribute('aria-label', 'Zmniejsz ilość');
                        
                        // Create input
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.min = '1';
                        input.max = '100';
                        input.value = '1';
                        input.className = 'quantity-input';
                        input.dataset.service = checkbox.value;
                        
                        // Create increment button
                        const incrementBtn = document.createElement('button');
                        incrementBtn.type = 'button';
                        incrementBtn.className = 'quantity-btn';
                        incrementBtn.textContent = '+';
                        incrementBtn.setAttribute('aria-label', 'Zwiększ ilość');
                        
                        // Add event listeners
                        decrementBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(input.value) || 1;
                            const newValue = Math.max(1, currentValue - 1);
                            input.value = newValue;
                            this.updateServiceQuantity(checkbox.value, newValue);
                        });
                        
                        incrementBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = parseInt(input.value) || 1;
                            const newValue = Math.min(100, currentValue + 1);
                            input.value = newValue;
                            this.updateServiceQuantity(checkbox.value, newValue);
                        });
                        
                        input.addEventListener('input', (e) => {
                            e.stopPropagation();
                            let value = parseInt(input.value) || 1;
                            value = Math.max(1, Math.min(100, value));
                            input.value = value;
                            this.updateServiceQuantity(checkbox.value, value);
                        });
                        
                        input.addEventListener('blur', (e) => {
                            e.stopPropagation();
                            if (!input.value || input.value === '0') {
                                input.value = '1';
                                this.updateServiceQuantity(checkbox.value, 1);
                            }
                        });
                        
                        input.addEventListener('click', (e) => {
                            e.stopPropagation();
                        });
                        
                        // Add elements to controls
                        controls.appendChild(decrementBtn);
                        controls.appendChild(input);
                        controls.appendChild(incrementBtn);
                        
                        // Add elements to container
                        quantityContainer.appendChild(label);
                        quantityContainer.appendChild(controls);
                        
                        // Add container after checkbox label
                        serviceContainer.appendChild(quantityContainer);
                    }
                });

                // Adjust checkbox event listeners to show/hide quantity inputs
                this.elements.additionalServicesCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const serviceContainer = checkbox.closest('.checkbox-option');
                        if (serviceContainer) {
                            const quantityContainer = serviceContainer.querySelector('.quantity-container');
                            if (quantityContainer) {
                                if (checkbox.checked) {
                                    quantityContainer.style.display = 'flex';
                                    setTimeout(() => {
                                        quantityContainer.style.opacity = '1';
                                        quantityContainer.style.transform = 'translateY(0)';
                                    }, 0);
                                } else {
                                    quantityContainer.style.opacity = '0';
                                    quantityContainer.style.transform = 'translateY(-10px)';
                                    setTimeout(() => {
                                        quantityContainer.style.display = 'none';
                                    }, 300);
                                }
                            }
                        }
                        this.updateAdditionalService(checkbox.value, checkbox.checked);
                    });
                });
            }
        },
        
        // Cache DOM elements
        cacheElements() {
            this.elements = {
                steps: document.querySelectorAll('.calculator-step'),
                progressIndicator: document.querySelector('.progress-indicator'),
                currentStepLabel: document.getElementById('current-step'),
                nextButtons: document.querySelectorAll('.next-step-btn'),
                prevButtons: document.querySelectorAll('.prev-step-btn'),
                recalculateButton: document.querySelector('.recalculate-btn'),
                currencyRadios: document.querySelectorAll('input[name="currency"]'),
                collaborationRadios: document.querySelectorAll('input[name="collaboration"]'),
                formatCheckboxes: document.querySelectorAll('input[name="format"]'),
                customFormatCheckbox: document.getElementById('custom-format-checkbox'),
                customFormatFields: document.querySelector('.custom-format-fields'),
                customQuantity: document.getElementById('custom-quantity'),
                customLength: document.getElementById('custom-length'),
                complexityRadios: document.querySelectorAll('input[name="complexity"]'),
                additionalServicesCheckboxes: document.querySelectorAll('input[name="additional"]'),
                formatError: document.querySelector('.format-error'),
                summaryCurrency: document.getElementById('summary-currency'),
                summaryCollaboration: document.getElementById('summary-collaboration'),
                summaryFormat: document.getElementById('summary-format'),
                summaryComplexity: document.getElementById('summary-complexity'),
                summaryServices: document.getElementById('summary-services'),
                totalCost: document.getElementById('total-cost'),
                minCostValue: document.getElementById('min-cost-value'),
                currentCostValue: document.getElementById('current-cost-value'),
                maxCostValue: document.getElementById('max-cost-value'),
                calculatorSummaryDesktop: document.querySelector('.calculator-summary-desktop'),
                sidebarCurrency: document.getElementById('sidebar-currency'),
                sidebarCollaboration: document.getElementById('sidebar-collaboration'),
                sidebarFormat: document.getElementById('sidebar-format'),
                sidebarComplexity: document.getElementById('sidebar-complexity'),
                sidebarTotal: document.getElementById('sidebar-total'),
                loadingIndicator: document.querySelector('.loading-indicator'),
                calculatorSummaryMobile: document.querySelector('.calculator-summary-mobile'),
                mobileSummary: document.querySelector('.calculator-summary-mobile .summary-total'),
                downloadPdfButton: document.querySelector('.download-pdf'),
                contactMeButton: document.querySelector('.contact-me')
            };

            // Add spans to buttons for better styling
            if (this.elements.nextButtons) {
                this.elements.nextButtons.forEach(button => {
                    const buttonText = button.textContent;
                    button.innerHTML = `<span>${buttonText}</span>`;
                });
            }

            if (this.elements.prevButtons) {
                this.elements.prevButtons.forEach(button => {
                    const buttonText = button.textContent;
                    button.innerHTML = `<span>${buttonText}</span>`;
                });
            }
            
            if (this.elements.recalculateButton) {
                const buttonText = this.elements.recalculateButton.textContent;
                this.elements.recalculateButton.innerHTML = `<span>${buttonText}</span>`;
            }
        },
        
        // Bind event listeners
        bindEvents() {
            // Next and previous step buttons
            if (this.elements.nextButtons) {
                this.elements.nextButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.nextStep();
                    });
                });
            }
            
            if (this.elements.prevButtons) {
                this.elements.prevButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.prevStep();
                    });
                });
            }

            // Recalculate button
            if (this.elements.recalculateButton) {
                this.elements.recalculateButton.addEventListener('click', () => this.recalculate());
            }

            // Currency selection
            if (this.elements.currencyRadios) {
                this.elements.currencyRadios.forEach(radio => {
                    radio.addEventListener('change', () => this.updateCurrency(radio.value));
                });
            }

            // Collaboration selection
            if (this.elements.collaborationRadios) {
                this.elements.collaborationRadios.forEach(radio => {
                    radio.addEventListener('change', () => this.updateCollaboration(radio.value));
                });
            }

            // Custom format
            if (this.elements.customFormatCheckbox) {
                this.elements.customFormatCheckbox.addEventListener('change', () => {
                    this.updateCustomFormat(this.elements.customFormatCheckbox.checked);
                });
            }

            if (this.elements.customQuantity) {
                this.elements.customQuantity.addEventListener('input', () => {
                    this.updateCustomQuantity(parseInt(this.elements.customQuantity.value) || 1);
                });
            }

            if (this.elements.customLength) {
                this.elements.customLength.addEventListener('input', () => {
                    this.updateCustomLength(parseFloat(this.elements.customLength.value) || 5);
                });
            }

            // Complexity selection
            if (this.elements.complexityRadios) {
                this.elements.complexityRadios.forEach(radio => {
                    radio.addEventListener('change', () => this.updateComplexity(radio.value));
                });
            }

            // Additional services
            if (this.elements.additionalServicesCheckboxes) {
                this.elements.additionalServicesCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => this.updateAdditionalService(checkbox.value, checkbox.checked));
                });
            }

            // Action buttons
            if (this.elements.downloadPdfButton) {
                this.elements.downloadPdfButton.addEventListener('click', () => this.downloadPdf());
            }

            if (this.elements.contactMeButton) {
                this.elements.contactMeButton.addEventListener('click', () => this.contactMe());
            }
        },
        
        // Update the progress bar
        updateProgressBar() {
            if (this.elements.progressIndicator && this.elements.currentStepLabel) {
                const progressPercentage = (this.state.currentStep / 6) * 100;
                this.elements.progressIndicator.style.width = `${progressPercentage}%`;
                this.elements.currentStepLabel.textContent = this.state.currentStep;
            }
        },
        
        // Go to next step
        nextStep() {
            // Update formats before validation
            this.updateFormats();
            
            // Validate current step
            if (this.state.currentStep === 3) {
                // Check if at least one format is selected
                if (this.state.formats.length === 0) {
                    if (this.elements.formatError) {
                        this.elements.formatError.style.display = 'block';
                        this.elements.formatError.classList.add('shake');
                        setTimeout(() => {
                            this.elements.formatError.classList.remove('shake');
                        }, 500);
                        return;
                    }
                } else if (this.elements.formatError) {
                    this.elements.formatError.style.display = 'none';
                }
            }
            
            if (this.state.currentStep < 6) {
                const nextStep = this.state.currentStep + 1;
                this.goToStep(nextStep);
            }
        },
        
        // Go to previous step
        prevStep() {
            if (this.state.currentStep > 1) {
                this.goToStep(this.state.currentStep - 1);
            }
        },
        
        // Go to a specific step
        goToStep(step) {
            // Validate step number
            if (step < 1 || step > 6) {
                return;
            }
            
            // Hide all steps first
            if (this.elements.steps) {
                this.elements.steps.forEach(stepElement => {
                    stepElement.style.display = 'none';
                    stepElement.style.opacity = '0';
                    stepElement.style.transform = 'translateY(20px)';
                });
                
                // Show the target step
                const targetStep = Array.from(this.elements.steps).find(el => parseInt(el.dataset.step) === step);
                if (targetStep) {
                    targetStep.style.display = 'block';
                    // Force reflow
                    targetStep.offsetHeight;
                    targetStep.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    targetStep.style.opacity = '1';
                    targetStep.style.transform = 'translateY(0)';
                }
            }
            
            this.state.currentStep = step;
            this.updateProgressBar();
            
            // Only show summary on mobile when on the final step
            if (this.elements.calculatorSummaryMobile) {
                this.elements.calculatorSummaryMobile.style.display = step === 6 ? 'flex' : 'none';
            }
            
            // Update summary after step change
            this.updateSummary();
        },
        
        // Update formats based on checkbox selection
        updateFormats() {
            this.state.formats = [];
            
            if (this.elements.formatCheckboxes) {
                this.elements.formatCheckboxes.forEach(checkbox => {
                    if (checkbox.checked && checkbox.value !== 'custom') {
                        this.state.formats.push(checkbox.value);
                    }
                });
                
                // Add custom format if selected
                if (this.elements.customFormatCheckbox && this.elements.customFormatCheckbox.checked) {
                    this.state.formats.push('custom');
                }
            }
            
            this.updateSummary();
        },
        
        // Update format quantity
        updateFormatQuantity(format, quantity) {
            this.state.formatQuantities[format] = Math.max(1, Math.min(100, quantity));
            
            // Update the input value to reflect constraints
            if (this.elements.formatQuantityInputs && this.elements.formatQuantityInputs[format]) {
                this.elements.formatQuantityInputs[format].value = this.state.formatQuantities[format];
            }
            
            this.updateSummary();
        },
        
        // Update additional services based on checkbox selection
        updateAdditionalServices() {
            this.state.additionalServices = [];
            
            if (this.elements.additionalServicesCheckboxes) {
                this.elements.additionalServicesCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        this.state.additionalServices.push(checkbox.value);
                    }
                });
            }
            
            this.updateSummary();
        },
        
        // Calculate the total cost
        calculateTotalCost() {
            let totalCostPLN = 0;
            
            // 1. Calculate base cost from formats
            let baseFormatCost = 0;
            
            this.state.formats.forEach(format => {
                if (format === 'custom') {
                    // Custom format: quantity × length × base rate
                    const customCost = this.state.customFormat.quantity * 
                                      this.state.customFormat.length * 
                                      this.config.baseRatePerMinute;
                    baseFormatCost += customCost;
                } else {
                    // Standard format: use fixed price if available, otherwise calculate based on length
                    const formatConfig = this.config.videoFormats[format];
                    if (formatConfig) {
                        const quantity = this.state.formatQuantities[format];
                        let formatCost;
                        if (formatConfig.fixedPrice) {
                            formatCost = quantity * formatConfig.fixedPrice;
                        } else {
                            formatCost = quantity * formatConfig.length * this.config.baseRatePerMinute;
                        }
                        baseFormatCost += formatCost;
                    }
                }
            });
            
            // 2. Apply complexity multiplier
            const complexityMultiplier = this.config.complexityMultipliers[this.state.complexity] || 1.0;
            let costWithComplexity = baseFormatCost * complexityMultiplier;
            
            // 3. Apply collaboration multiplier
            const collaborationMultiplier = this.config.collaborationMultipliers[this.state.collaboration] || 1.0;
            let costWithCollaboration = costWithComplexity * collaborationMultiplier;
            
            // 4. Add additional services with quantities
            this.state.additionalServices.forEach(service => {
                const serviceConfig = this.config.additionalServices[service];
                if (serviceConfig) {
                    const quantity = this.state.serviceQuantities[service];
                    costWithCollaboration += serviceConfig.price * quantity;
                }
            });
            
            totalCostPLN = costWithCollaboration;
            
            // 5. Convert to selected currency if needed
            if (this.state.currency === 'USD') {
                const costUSD = totalCostPLN / this.config.exchangeRate;
                return costUSD;
            }
            
            return totalCostPLN;
        },
        
        // Show loading indicator
        showLoading() {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.classList.add('active');
            }
        },
        
        // Hide loading indicator
        hideLoading() {
            if (this.elements.loadingIndicator) {
                setTimeout(() => {
                    this.elements.loadingIndicator.classList.remove('active');
                }, 600);
            }
        },
        
        // Format currency based on current selection
        formatCurrency(value) {
            let rounded = Math.round(value);
            if (this.state.currency === 'USD') {
                return `${rounded} USD`;
            } else {
                return `${rounded} PLN`;
            }
        },
        
        // Get text for collaboration type
        getCollaborationText() {
            switch (this.state.collaboration) {
                case 'onetime': return 'Jednorazowa produkcja';
                case 'multiple': return 'Projekt 2–9 produkcji';
                case 'regular': return 'Stała współpraca 10+ produkcji';
                default: return 'Jednorazowa produkcja';
            }
        },
        
        // Get text for selected formats
        getFormatText() {
            if (this.state.formats.length === 0) return '-';
            
            const formatNames = this.state.formats.map(format => {
                if (format === 'custom') {
                    return `Custom (${this.state.customFormat.quantity} × ${this.state.customFormat.length} min)`;
                } else {
                    const quantity = this.state.formatQuantities[format];
                    return `${this.config.videoFormats[format].name} (${quantity} szt.)`;
                }
            });
            
            return formatNames.join(', ');
        },
        
        // Get text for complexity level
        getComplexityText() {
            switch (this.state.complexity) {
                case 'basic': return 'Podstawowy';
                case 'advanced': return 'Zaawansowany';
                case 'premium': return 'Premium';
                default: return 'Podstawowy';
            }
        },
        
        // Get text for additional services
        getServicesText() {
            if (this.state.additionalServices.length === 0) return '-';
            
            const serviceNames = this.state.additionalServices.map(service => {
                const serviceConfig = this.config.additionalServices[service];
                const quantity = this.state.serviceQuantities[service];
                const unit = serviceConfig.perMonth ? 'mies.' : 'szt.';
                return `${serviceConfig.name} (${quantity} ${unit})`;
            });
            
            return serviceNames.join(', ');
        },
        
        // Update summary display in UI
        updateSummary() {
            this.showLoading();
            
            // Calculate cost
            this.state.totalCost = this.calculateTotalCost();
            const formattedCost = this.formatCurrency(this.state.totalCost);
            
            // Calculate min and max values (±20%)
            const minCost = this.state.totalCost * 0.8;
            const maxCost = this.state.totalCost * 1.2;
            
            // Update main summary
            if (this.elements.summaryCurrency) {
                this.elements.summaryCurrency.textContent = this.state.currency;
            }
            
            if (this.elements.summaryCollaboration) {
                this.elements.summaryCollaboration.textContent = this.getCollaborationText();
            }
            
            if (this.elements.summaryFormat) {
                this.elements.summaryFormat.textContent = this.getFormatText();
            }
            
            if (this.elements.summaryComplexity) {
                this.elements.summaryComplexity.textContent = this.getComplexityText();
            }
            
            if (this.elements.summaryServices) {
                this.elements.summaryServices.textContent = this.getServicesText();
            }
            
            // Update cost values
            if (this.elements.totalCost) {
                this.elements.totalCost.textContent = formattedCost;
            }
            
            if (this.elements.minCostValue) {
                this.elements.minCostValue.textContent = this.formatCurrency(minCost);
            }
            
            if (this.elements.currentCostValue) {
                this.elements.currentCostValue.textContent = formattedCost;
            }
            
            if (this.elements.maxCostValue) {
                this.elements.maxCostValue.textContent = this.formatCurrency(maxCost);
            }
            
            // Update sidebar summary
            if (this.elements.sidebarCurrency) {
                this.elements.sidebarCurrency.textContent = this.state.currency;
            }
            
            if (this.elements.sidebarCollaboration) {
                this.elements.sidebarCollaboration.textContent = this.getCollaborationText();
            }
            
            if (this.elements.sidebarFormat) {
                this.elements.sidebarFormat.textContent = this.getFormatText();
            }
            
            if (this.elements.sidebarComplexity) {
                this.elements.sidebarComplexity.textContent = this.getComplexityText();
            }
            
            if (this.elements.sidebarTotal) {
                this.elements.sidebarTotal.textContent = formattedCost;
            }
            
            // Update mobile summary
            if (this.elements.mobileSummary) {
                this.elements.mobileSummary.textContent = formattedCost;
            }
            
            // Set range bar widths
            document.querySelector('.range-bar-min').style.width = '20%';
            document.querySelector('.range-bar-current').style.width = '60%';
            document.querySelector('.range-bar-max').style.width = '20%';
            
            this.hideLoading();
        },
        
        // Handle PDF download
        downloadPdf() {
            alert('Generowanie PDF zostanie zaimplementowane wkrótce');
            // Implementation for PDF generation will be added later
        },
        
        // Handle contact button
        contactMe() {
            window.location.href = 'index.html#consultation';
        },
        
        // Update currency selection
        updateCurrency(currency) {
            this.state.currency = currency;
            this.updateSummary();
        },
        
        // Update collaboration type
        updateCollaboration(collaboration) {
            this.state.collaboration = collaboration;
            this.updateSummary();
        },
        
        // Update format selection
        updateFormat(format, isChecked) {
            this.updateFormats();
            if (format === 'custom' && isChecked) {
                this.updateCustomFormat(true);
            }
        },
        
        // Update custom format display
        updateCustomFormat(isChecked) {
            if (this.elements.customFormatFields) {
                this.elements.customFormatFields.style.display = isChecked ? 'flex' : 'none';
            }
            this.updateFormats();
        },
        
        // Update custom quantity value
        updateCustomQuantity(quantity) {
            this.state.customFormat.quantity = Math.max(1, Math.min(100, quantity));
            if (this.elements.customQuantity) {
                this.elements.customQuantity.value = this.state.customFormat.quantity;
            }
            this.updateSummary();
        },
        
        // Update custom length value
        updateCustomLength(length) {
            this.state.customFormat.length = Math.max(1, Math.min(120, length));
            if (this.elements.customLength) {
                this.elements.customLength.value = this.state.customFormat.length;
            }
            this.updateSummary();
        },
        
        // Update complexity level
        updateComplexity(complexity) {
            this.state.complexity = complexity;
            this.updateSummary();
        },
        
        // Update additional service selection
        updateAdditionalService(service, isChecked) {
            this.updateAdditionalServices();
        },
        
        // Update service quantity
        updateServiceQuantity(service, quantity) {
            this.state.serviceQuantities[service] = Math.max(1, Math.min(100, quantity));
            this.updateSummary();
        },
        
        // Recalculate all values
        recalculate() {
            this.updateSummary();
        }
    };
    
    // Initialize calculator
    Calculator.init();
}); 