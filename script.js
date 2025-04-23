// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarNav = document.querySelector('.navbar-nav');

    if (menuToggle && navbarNav) {
        menuToggle.addEventListener('click', function() {
            navbarNav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navbarNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navbarNav.contains(event.target) && !menuToggle.contains(event.target)) {
                navbarNav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Ensure video is properly loaded and displayed
    const heroVideo = document.getElementById('hero-video');
    
    if (heroVideo) {
        // Handle video loading errors gracefully
        heroVideo.addEventListener('error', () => {
            console.error('Error loading video');
            // Add a fallback background if the video fails to load
            document.querySelector('.video-background').style.backgroundImage = 'linear-gradient(135deg, #392d7c 0%, #9b30b5 100%)';
        });
    }

    // Calculator functionality
    const Calculator = {
        // Configuration constants
        config: {
            debug: true, // Enable debug mode
            exchangeRate: 3.80, // 1 USD = 3.80 PLN
            baseRatePerMinute: 70, // 70 PLN per minute
            videoFormats: {
                quick_reel: { name: "Błyskawiczny Reel", length: 1 },
                standard_reel: { name: "Reel Standardowy", length: 2 },
                short_film: { name: "Krótki Film", length: 5.5 },
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
                youtube: { price: 750, name: "Zarządzanie YouTube" }, // 750 PLN/month
                consulting: { price: 500, name: "Konsulting wideo" }, // 500 PLN/month
                thumbnails: { price: 100, name: "Miniaturki" } // 100 PLN/piece
            }
        },
        
        // State variables
        state: {
            currency: "PLN",
            collaboration: "onetime",
            formats: [],
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
            if (this.config.debug) console.log('Initializing calculator...');
            this.cacheElements();
            this.bindEvents();
            this.updateProgressBar();
            this.updateSummary();
            
            // Hide mobile summary by default - only show at the end
            if (this.elements.calculatorSummaryMobile) {
                this.elements.calculatorSummaryMobile.style.display = 'none';
            }
            
            // Show first step
            this.goToStep(1);
            if (this.config.debug) console.log('Calculator initialized successfully.');
        },
        
        // Cache DOM elements
        cacheElements() {
            // Initialize elements object
            if (this.config.debug) console.log('Caching DOM elements...');
            this.elements = {};

            // Ensure the DOM is fully loaded
            if (!document.body) {
                console.error('Document body not ready, cannot cache elements');
                return;
            }

            // Cache required elements with error handling
            const requiredElements = {
                steps: '.calculator-step',
                progressIndicator: '.progress-indicator',
                currentStepLabel: '#current-step',
                nextButtons: '.next-step-btn',
                prevButtons: '.prev-step-btn',
                recalculateButton: '.recalculate-btn',
                currencyRadios: 'input[name="currency"]',
                collaborationRadios: 'input[name="collaboration"]',
                formatCheckboxes: 'input[name="format"]',
                customFormatCheckbox: '#custom-format-checkbox',
                customFormatFields: '.custom-format-fields',
                customQuantity: '#custom-quantity',
                customLength: '#custom-length',
                complexityRadios: 'input[name="complexity"]',
                additionalServicesCheckboxes: 'input[name="additional"]',
                formatError: '.format-error',
                summaryCurrency: '#summary-currency',
                summaryCollaboration: '#summary-collaboration',
                summaryFormat: '#summary-format',
                summaryComplexity: '#summary-complexity',
                summaryServices: '#summary-services',
                totalCost: '#total-cost',
                minCostValue: '#min-cost-value',
                currentCostValue: '#current-cost-value',
                maxCostValue: '#max-cost-value',
                calculatorSummaryDesktop: '.calculator-summary-desktop',
                sidebarCurrency: '#sidebar-currency',
                sidebarCollaboration: '#sidebar-collaboration',
                sidebarFormat: '#sidebar-format',
                sidebarComplexity: '#sidebar-complexity',
                sidebarTotal: '#sidebar-total',
                loadingIndicator: '.loading-indicator',
                calculatorSummaryMobile: '.calculator-summary-mobile',
                mobileSummary: '.calculator-summary-mobile .summary-total',
                downloadPdfButton: '.download-pdf',
                contactMeButton: '.contact-me'
            };

            // Debug elements before caching
            for (const [key, selector] of Object.entries(requiredElements)) {
                const count = document.querySelectorAll(selector).length;
                console.log(`Found ${count} elements matching "${selector}"`);
            }

            // Cache each element with error handling
            for (const [key, selector] of Object.entries(requiredElements)) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    this.elements[key] = elements.length === 1 ? elements[0] : Array.from(elements);
                    if (this.config.debug) console.log(`Cached ${elements.length} element(s) for ${key}`);
                } else {
                    console.warn(`Element not found: ${selector}`);
                    this.elements[key] = null;
                }
            }

            // Add spans to buttons for better styling
            if (this.elements.nextButtons) {
                if (this.config.debug) console.log(`Found ${this.elements.nextButtons.length} next buttons`);
                this.elements.nextButtons.forEach((button, index) => {
                    const buttonText = button.textContent;
                    button.innerHTML = `<span>${buttonText}</span>`;
                    if (this.config.debug) console.log(`Formatted next button ${index+1}`);
                });
            }

            if (this.elements.prevButtons) {
                this.elements.prevButtons.forEach(button => {
                    const buttonText = button.textContent;
                    button.innerHTML = `<span>${buttonText}</span>`;
                });
            }
        },
        
        // Bind event listeners
        bindEvents() {
            if (this.config.debug) console.log('Binding event listeners...');
            
            // Next and previous step buttons
            if (this.elements.nextButtons) {
                this.elements.nextButtons.forEach((button, index) => {
                    if (this.config.debug) console.log(`Adding click listener to next button ${index+1}`);
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (this.config.debug) console.log(`Next button ${index+1} clicked, current step: ${this.state.currentStep}`);
                        this.nextStep();
                    });
                });
            } else {
                console.error('Next buttons not found');
            }
            
            if (this.elements.prevButtons) {
                this.elements.prevButtons.forEach((button, index) => {
                    if (this.config.debug) console.log(`Adding click listener to prev button ${index+1}`);
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (this.config.debug) console.log(`Prev button ${index+1} clicked, current step: ${this.state.currentStep}`);
                        this.prevStep();
                    });
                });
            } else {
                console.error('Previous buttons not found');
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

            // Format selection
            if (this.elements.formatCheckboxes) {
                this.elements.formatCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => this.updateFormat(checkbox.value, checkbox.checked));
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
                    this.updateCustomQuantity(this.elements.customQuantity.value);
                });
            }

            if (this.elements.customLength) {
                this.elements.customLength.addEventListener('input', () => {
                    this.updateCustomLength(this.elements.customLength.value);
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
            if (this.config.debug) console.log(`nextStep called, current step: ${this.state.currentStep}`);
            
            // Update formats before validation
            this.updateFormats();
            
            // Validate current step
            if (this.state.currentStep === 3) {
                // Check if at least one format is selected
                if (this.state.formats.length === 0) {
                    if (this.elements.formatError) {
                        this.elements.formatError.style.display = 'block';
                        if (this.config.debug) console.log('Format validation failed: no formats selected');
                    }
                    return;
                } else if (this.elements.formatError) {
                    this.elements.formatError.style.display = 'none';
                    if (this.config.debug) console.log('Format validation passed');
                }
            }
            
            if (this.state.currentStep < 6) {
                const nextStep = this.state.currentStep + 1;
                if (this.config.debug) console.log(`Moving to step ${nextStep}`);
                this.goToStep(nextStep);
            } else {
                if (this.config.debug) console.log('Already at last step, not advancing');
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
            try {
                if (this.config.debug) console.log(`goToStep(${step}) called`);
                
                // Validate step number
                if (step < 1 || step > 6) {
                    console.error(`Invalid step number: ${step}`);
                    return;
                }
                
                // Hide all steps first
                if (this.elements.steps) {
                    this.elements.steps.forEach(stepElement => {
                        const stepNum = parseInt(stepElement.dataset.step);
                        stepElement.style.display = 'none';
                        stepElement.style.opacity = '0';
                        stepElement.style.transform = 'translateY(20px)';
                    });
                    
                    // Show the target step
                    const targetStep = Array.from(this.elements.steps).find(el => parseInt(el.dataset.step) === step);
                    if (targetStep) {
                        if (this.config.debug) console.log(`Showing step ${step}`);
                        targetStep.style.display = 'block';
                        // Force reflow
                        targetStep.offsetHeight;
                        targetStep.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        targetStep.style.opacity = '1';
                        targetStep.style.transform = 'translateY(0)';
                    } else {
                        console.error(`Step element not found for step ${step}`);
                    }
                } else {
                    console.error('Steps elements not found');
                }
                
                this.state.currentStep = step;
                this.updateProgressBar();
                
                // Only show summary on mobile when on the final step
                if (this.elements.calculatorSummaryMobile) {
                    this.elements.calculatorSummaryMobile.style.display = step === 6 ? 'flex' : 'none';
                }
                
                // Update summary after step change
                this.updateSummary();
            } catch (error) {
                console.error('Error in goToStep:', error);
            }
        },
        
        // Update formats based on checkbox selection
        updateFormats() {
            if (this.config.debug) console.log('Updating formats...');
            
            this.state.formats = [];
            
            if (this.elements.formatCheckboxes) {
                this.elements.formatCheckboxes.forEach(checkbox => {
                    if (checkbox.checked && checkbox.value !== 'custom') {
                        this.state.formats.push(checkbox.value);
                        if (this.config.debug) console.log(`Added format: ${checkbox.value}`);
                    }
                });
                
                // Add custom format if selected
                if (this.elements.customFormatCheckbox && this.elements.customFormatCheckbox.checked) {
                    this.state.formats.push('custom');
                    if (this.config.debug) console.log('Added custom format');
                }
                
                if (this.config.debug) console.log(`Total formats selected: ${this.state.formats.length}`);
            } else {
                console.error('Format checkboxes not found');
            }
        },
        
        // Update additional services based on checkbox selection
        updateAdditionalServices() {
            if (this.config.debug) console.log('Updating additional services...');
            
            this.state.additionalServices = [];
            
            if (this.elements.additionalServicesCheckboxes) {
                this.elements.additionalServicesCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        this.state.additionalServices.push(checkbox.value);
                        if (this.config.debug) console.log(`Added service: ${checkbox.value}`);
                    }
                });
                
                if (this.config.debug) console.log(`Total services selected: ${this.state.additionalServices.length}`);
            } else {
                console.error('Additional services checkboxes not found');
            }
        },
        
        // Calculate the total cost
        calculateTotalCost() {
            if (this.config.debug) console.log('Calculating total cost...');
            
            let totalCostPLN = 0;
            
            // 1. Calculate base cost from formats
            let baseFormatCost = 0;
            
            if (this.config.debug) console.log(`Formats selected: ${JSON.stringify(this.state.formats)}`);
            
            this.state.formats.forEach(format => {
                if (format === 'custom') {
                    // Custom format: quantity × length × base rate
                    const customCost = this.state.customFormat.quantity * 
                                      this.state.customFormat.length * 
                                      this.config.baseRatePerMinute;
                    baseFormatCost += customCost;
                    if (this.config.debug) console.log(`Custom format cost: ${customCost} PLN (${this.state.customFormat.quantity} × ${this.state.customFormat.length} min × ${this.config.baseRatePerMinute} PLN)`);
                } else {
                    // Standard format: length × base rate
                    const formatConfig = this.config.videoFormats[format];
                    if (formatConfig) {
                        const formatCost = formatConfig.length * this.config.baseRatePerMinute;
                        baseFormatCost += formatCost;
                        if (this.config.debug) console.log(`${formatConfig.name} cost: ${formatCost} PLN (${formatConfig.length} min × ${this.config.baseRatePerMinute} PLN)`);
                    }
                }
            });
            
            if (this.config.debug) console.log(`Base format cost: ${baseFormatCost} PLN`);
            
            // 2. Apply complexity multiplier
            const complexityMultiplier = this.config.complexityMultipliers[this.state.complexity] || 1.0;
            let costWithComplexity = baseFormatCost * complexityMultiplier;
            if (this.config.debug) console.log(`After complexity (${this.state.complexity}, ×${complexityMultiplier}): ${costWithComplexity} PLN`);
            
            // 3. Apply collaboration multiplier
            const collaborationMultiplier = this.config.collaborationMultipliers[this.state.collaboration] || 1.0;
            let costWithCollaboration = costWithComplexity * collaborationMultiplier;
            if (this.config.debug) console.log(`After collaboration (${this.state.collaboration}, ×${collaborationMultiplier}): ${costWithCollaboration} PLN`);
            
            // 4. Add additional services
            if (this.config.debug) console.log(`Additional services: ${JSON.stringify(this.state.additionalServices)}`);
            
            this.state.additionalServices.forEach(service => {
                const serviceConfig = this.config.additionalServices[service];
                if (serviceConfig) {
                    costWithCollaboration += serviceConfig.price;
                    if (this.config.debug) console.log(`Added ${serviceConfig.name}: +${serviceConfig.price} PLN`);
                }
            });
            
            totalCostPLN = costWithCollaboration;
            if (this.config.debug) console.log(`Final cost in PLN: ${totalCostPLN}`);
            
            // 5. Convert to selected currency if needed
            if (this.state.currency === 'USD') {
                const costUSD = totalCostPLN / this.config.exchangeRate;
                if (this.config.debug) console.log(`Converted to USD: ${costUSD} (${totalCostPLN} ÷ ${this.config.exchangeRate})`);
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
                }, 600); // Slightly longer for more polished feel
            }
        },
        
        // Format currency based on current selection
        formatCurrency(value) {
            let rounded = Math.round(value);
            if (this.state.currency === 'USD') {
                return `${rounded} USD`;
            }
            return `${rounded} PLN`;
        },
        
        // Get collaboration text
        getCollaborationText() {
            switch (this.state.collaboration) {
                case 'onetime': return 'Jednorazowa produkcja';
                case 'multiple': return 'Projekt 2–9 produkcji';
                case 'regular': return 'Stała współpraca 10+ produkcji';
                default: return 'Jednorazowa produkcja';
            }
        },
        
        // Get format text
        getFormatText() {
            if (this.state.formats.length === 0) {
                return '-';
            }
            
            const formatNames = this.state.formats.map(format => {
                if (format === 'custom') {
                    return `Custom (${this.state.customFormat.quantity}× ${this.state.customFormat.length} min)`;
                }
                
                const formatConfig = this.config.videoFormats[format];
                return formatConfig ? formatConfig.name : '';
            }).filter(name => name !== '');
            
            return formatNames.join(', ');
        },
        
        // Get complexity text
        getComplexityText() {
            switch (this.state.complexity) {
                case 'basic': return 'Podstawowy';
                case 'advanced': return 'Zaawansowany';
                case 'premium': return 'Premium';
                default: return 'Podstawowy';
            }
        },
        
        // Get additional services text
        getServicesText() {
            if (this.state.additionalServices.length === 0) {
                return '-';
            }
            
            const serviceNames = this.state.additionalServices.map(service => {
                const serviceConfig = this.config.additionalServices[service];
                return serviceConfig ? serviceConfig.name : '';
            }).filter(name => name !== '');
            
            return serviceNames.join(', ');
        },
        
        // Update summary displays
        updateSummary() {
            this.showLoading();
            
            setTimeout(() => {
                // Calculate total cost
                const totalCost = this.calculateTotalCost();
                this.state.totalCost = totalCost;
                
                // Main summary (only visible in final step)
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
                
                // Total cost and range
                if (this.elements.totalCost) {
                    this.elements.totalCost.textContent = this.formatCurrency(totalCost);
                }
                
                if (this.elements.minCostValue) {
                    this.elements.minCostValue.textContent = this.formatCurrency(totalCost * 0.8);
                }
                
                if (this.elements.currentCostValue) {
                    this.elements.currentCostValue.textContent = this.formatCurrency(totalCost);
                }
                
                if (this.elements.maxCostValue) {
                    this.elements.maxCostValue.textContent = this.formatCurrency(totalCost * 1.2);
                }
                
                // Update range bar widths for visual display
                const rangeBar = document.querySelector('.range-bar');
                if (rangeBar) {
                    const minBar = rangeBar.querySelector('.range-bar-min');
                    const currentBar = rangeBar.querySelector('.range-bar-current');
                    const maxBar = rangeBar.querySelector('.range-bar-max');
                    
                    // Position the bars to show the current value centered
                    if (minBar && currentBar && maxBar) {
                        minBar.style.width = "40%";
                        currentBar.style.width = "20%";
                        maxBar.style.width = "40%";
                    }
                }
                
                // Sidebar summary (only visible in final step)
                if (this.elements.sidebarCurrency) {
                    this.elements.sidebarCurrency.textContent = this.state.currency;
                }
                
                if (this.elements.sidebarCollaboration) {
                    this.elements.sidebarCollaboration.textContent = this.state.collaboration === 'onetime' ? 
                        'Jednorazowa' : (this.state.collaboration === 'multiple' ? '2-9 produkcji' : '10+ produkcji');
                }
                
                if (this.elements.sidebarFormat) {
                    this.elements.sidebarFormat.textContent = this.state.formats.length > 0 ? 
                        `${this.state.formats.length} wybrane` : '-';
                }
                
                if (this.elements.sidebarComplexity) {
                    this.elements.sidebarComplexity.textContent = this.getComplexityText();
                }
                
                if (this.elements.sidebarTotal) {
                    this.elements.sidebarTotal.textContent = this.formatCurrency(totalCost);
                }
                
                // Mobile summary
                if (this.elements.mobileSummary) {
                    this.elements.mobileSummary.textContent = this.formatCurrency(totalCost);
                }
                
                this.hideLoading();
            }, 500); // Longer delay for better animation feel
        },
        
        // Generate and download PDF
        downloadPdf() {
            // This would typically integrate with a PDF generation library
            alert("Generowanie PDF zostanie zaimplementowane w przyszłości.");
        },
        
        // Contact button action
        contactMe() {
            // Scroll to contact section or open modal
            const contactSection = document.querySelector('.cta-section');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        },
        
        // Update currency
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
            this.updateSummary();
        },
        
        // Update custom format visibility
        updateCustomFormat(isChecked) {
            if (this.elements.customFormatFields) {
                this.elements.customFormatFields.style.display = isChecked ? 'flex' : 'none';
            }
            this.updateFormats();
            this.updateSummary();
        },
        
        // Update custom quantity
        updateCustomQuantity(quantity) {
            this.state.customFormat.quantity = parseInt(quantity) || 1;
            this.updateSummary();
        },
        
        // Update custom length
        updateCustomLength(length) {
            this.state.customFormat.length = parseInt(length) || 1;
            this.updateSummary();
        },
        
        // Update complexity
        updateComplexity(complexity) {
            this.state.complexity = complexity;
            this.updateSummary();
        },
        
        // Update additional service
        updateAdditionalService(service, isChecked) {
            this.updateAdditionalServices();
            this.updateSummary();
        },
        
        // Recalculate everything and start over
        recalculate() {
            // Reset to step 1
            this.goToStep(1);
            
            // Reset selections to defaults if needed
            if (this.elements.currencyRadios) {
                const defaultCurrency = this.elements.currencyRadios[0];
                if (defaultCurrency) {
                    defaultCurrency.checked = true;
                    this.state.currency = defaultCurrency.value;
                }
            }
            
            if (this.elements.collaborationRadios) {
                const defaultCollaboration = this.elements.collaborationRadios[0];
                if (defaultCollaboration) {
                    defaultCollaboration.checked = true;
                    this.state.collaboration = defaultCollaboration.value;
                }
            }
            
            if (this.elements.formatCheckboxes) {
                this.elements.formatCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                this.state.formats = [];
            }
            
            if (this.elements.customFormatCheckbox) {
                this.elements.customFormatCheckbox.checked = false;
            }
            
            if (this.elements.customFormatFields) {
                this.elements.customFormatFields.style.display = 'none';
            }
            
            if (this.elements.customQuantity) {
                this.elements.customQuantity.value = 1;
                this.state.customFormat.quantity = 1;
            }
            
            if (this.elements.customLength) {
                this.elements.customLength.value = 5;
                this.state.customFormat.length = 5;
            }
            
            if (this.elements.complexityRadios) {
                const defaultComplexity = this.elements.complexityRadios[0];
                if (defaultComplexity) {
                    defaultComplexity.checked = true;
                    this.state.complexity = defaultComplexity.value;
                }
            }
            
            if (this.elements.additionalServicesCheckboxes) {
                this.elements.additionalServicesCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                this.state.additionalServices = [];
            }
            
            // Update summary
            this.updateSummary();
        }
    };

    // Initialize Services Swiper
    const servicesSwiper = new Swiper('.services-swiper', {
        slidesPerView: 3,
        spaceBetween: 30,
        centeredSlides: true,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            }
        }
    });

    // Segment switching functionality
    const segmentButtons = document.querySelectorAll('.segment-button');
    const segments = document.querySelectorAll('.audience-segment');

    segmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and segments
            segmentButtons.forEach(btn => btn.classList.remove('active'));
            segments.forEach(segment => segment.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding segment
            const segmentId = button.dataset.segment + '-segment';
            document.getElementById(segmentId).classList.add('active');
        });
    });

    // Image Comparison Slider
    const initializeImageComparison = () => {
        const sliders = document.querySelectorAll('.image-compare');
        
        if (sliders.length === 0) {
            console.log('No image comparison sliders found');
            return;
        }
        
        console.log(`Initializing ${sliders.length} image comparison sliders`);
        
        sliders.forEach(slider => {
            const sliderOverlay = slider.querySelector('.slider-overlay');
            const sliderHandle = slider.querySelector('.slider-handle');
            const beforeImage = slider.querySelector('.before-image');
            const afterImage = slider.querySelector('.after-image');
            
            if (!sliderOverlay || !sliderHandle || !beforeImage || !afterImage) {
                console.error('Required slider elements not found');
                return;
            }
            
            let isResizing = false;
            
            // Initialize slider position
            const initSlider = () => {
                updateSliderPosition(50);
                slider.classList.add('initialized');
                console.log('Slider initialized');
            };
            
            // Wait for images to load before initializing
            Promise.all([
                beforeImage.complete ? Promise.resolve() : new Promise(resolve => beforeImage.onload = resolve),
                afterImage.complete ? Promise.resolve() : new Promise(resolve => afterImage.onload = resolve)
            ]).then(initSlider);
            
            function updateSliderPosition(position) {
                position = Math.min(Math.max(position, 0), 100);
                sliderOverlay.style.width = `${position}%`;
                sliderHandle.style.left = `${position}%`;
            }
            
            function getPositionFromEvent(e) {
                const rect = slider.getBoundingClientRect();
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const x = clientX - rect.left;
                const position = (x / rect.width) * 100;
                return position;
            }
            
            function startSliding(e) {
                if (e.type.includes('touch')) {
                    e.preventDefault(); // Prevent scrolling on touch start
                }
                isResizing = true;
                slider.classList.add('active');
                
                // Immediately update position
                updateSliderPosition(getPositionFromEvent(e));
            }
            
            function stopSliding() {
                isResizing = false;
                slider.classList.remove('active');
            }
            
            function slide(e) {
                if (!isResizing) return;
                
                e.preventDefault(); // Prevent scrolling and other default behaviors
                e.stopPropagation(); // Stop event bubbling
                
                updateSliderPosition(getPositionFromEvent(e));
            }
            
            // Clean up previous event listeners if they exist
            const cleanupOldListeners = () => {
                slider.removeEventListener('mousedown', startSliding);
                document.removeEventListener('mousemove', slide);
                document.removeEventListener('mouseup', stopSliding);
                
                slider.removeEventListener('touchstart', startSliding);
                document.removeEventListener('touchmove', slide);
                document.removeEventListener('touchend', stopSliding);
                document.removeEventListener('touchcancel', stopSliding);
            };
            
            // Clean up first
            cleanupOldListeners();
            
            // Setup mouse events
            slider.addEventListener('mousedown', startSliding);
            document.addEventListener('mousemove', slide);
            document.addEventListener('mouseup', stopSliding);
            
            // Setup touch events
            slider.addEventListener('touchstart', startSliding, { passive: false });
            document.addEventListener('touchmove', slide, { passive: false });
            document.addEventListener('touchend', stopSliding);
            document.addEventListener('touchcancel', stopSliding);
            
            // Prevent context menu on long press
            slider.addEventListener('contextmenu', e => e.preventDefault());
        });
    };
    
    // Initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeImageComparison);
    } else {
        initializeImageComparison();
    }

    // Re-initialize on window resize to handle potential layout changes
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initializeImageComparison, 250);
    });

    // Initialize the calculator if we're on the calculator page
    const calculatorContainer = document.querySelector('.calculator-container');
    if (calculatorContainer) {
        console.log("=== CALCULATOR PAGE DETECTED ===");
        
        // Simple step navigation functions - globally accessible
        function goToStep(stepNumber) {
            console.log(`Direct navigation to step ${stepNumber}`);
            
            // Hide all steps
            document.querySelectorAll('.calculator-step').forEach(step => {
                step.style.display = 'none';
            });
            
            // Show the requested step
            const targetStep = document.querySelector(`.calculator-step[data-step="${stepNumber}"]`);
            if (targetStep) {
                targetStep.style.display = 'block';
                
                // Update progress bar
                const progressIndicator = document.querySelector('.progress-indicator');
                if (progressIndicator) {
                    progressIndicator.style.width = `${(stepNumber / 6) * 100}%`;
                }
                
                // Update step counter
                const currentStep = document.getElementById('current-step');
                if (currentStep) {
                    currentStep.textContent = stepNumber;
                }
            }
        }

        function goToStep1() { goToStep(1); }
        function goToStep2() { goToStep(2); }
        function goToStep3() { goToStep(3); }
        function goToStep4() { goToStep(4); }
        function goToStep5() { goToStep(5); }
        function goToStep6() { goToStep(6); }

        function nextStep(currentStepNumber) {
            // Format validation for step 3
            if (currentStepNumber === 3) {
                const formatSelected = document.querySelectorAll('input[name="format"]:checked').length > 0;
                if (!formatSelected) {
                    const formatError = document.querySelector('.format-error');
                    if (formatError) formatError.style.display = 'block';
                    return;
                } else {
                    const formatError = document.querySelector('.format-error');
                    if (formatError) formatError.style.display = 'none';
                }
            }
            
            if (currentStepNumber < 6) {
                goToStep(currentStepNumber + 1);
            }
        }

        function prevStep(currentStepNumber) {
            if (currentStepNumber > 1) {
                goToStep(currentStepNumber - 1);
            }
        }

        // Add fresh event listeners to all navigation buttons
        document.querySelectorAll('.next-step-btn').forEach(button => {
            const stepElement = button.closest('.calculator-step');
            if (stepElement) {
                const stepNumber = parseInt(stepElement.dataset.step);
                button.onclick = function(e) {
                    e.preventDefault();
                    console.log(`Next button clicked on step ${stepNumber}`);
                    nextStep(stepNumber);
                    return false;
                };
            }
        });
        
        document.querySelectorAll('.prev-step-btn').forEach(button => {
            const stepElement = button.closest('.calculator-step');
            if (stepElement) {
                const stepNumber = parseInt(stepElement.dataset.step);
                button.onclick = function(e) {
                    e.preventDefault();
                    console.log(`Prev button clicked on step ${stepNumber}`);
                    prevStep(stepNumber);
                    return false;
                };
            }
        });
        
        // Handle recalculate button
        const recalculateBtn = document.querySelector('.recalculate-btn');
        if (recalculateBtn) {
            recalculateBtn.onclick = function(e) {
                e.preventDefault();
                // Reset form and go back to step 1
                goToStep(1);
                return false;
            };
        }
        
        // Attempt to initialize the Calculator
        try {
            Calculator.init();
        } catch (error) {
            console.error('Error initializing calculator:', error);
        }
        
        // Show first step
        goToStep(1);
    } else {
        console.log("Not on calculator page, skipping initialization");
    }

    // Smooth scroll to Calendly
    const consultationButton = document.querySelector('.cta-button.secondary[href="#calendly-container"]');
    if (consultationButton) {
        consultationButton.addEventListener('click', (e) => {
            e.preventDefault();
            const calendlyContainer = document.getElementById('calendly-container');
            if (calendlyContainer) {
                const offset = 80; // Adjust this value to control the scroll position offset
                const elementPosition = calendlyContainer.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}); 