/**
 * Analisi Dermoscopica - Applicazione educativa
 * 
 * Questo script implementa funzionalità avanzate per l'analisi dermoscopica di immagini
 * di lesioni cutanee pigmentate. Include elaborate funzioni di elaborazione immagini,
 * strumenti di misurazione e zoom, e algoritmi di valutazione basati su diversi metodi
 * dermoscopici riconosciuti.
 * 
 * IMPORTANTE: Questa applicazione è SOLO a scopo educativo.
 * Non è un dispositivo medico certificato e non è destinata all'autodiagnosi.
 * 
 * @author Applicazione didattica
 * @version 2.0
 */

'use strict';

// Avvio dell'applicazione quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', () => {
    // ------------------ Inizializzazione e riferimenti DOM ------------------
    
    // Elementi DOM principali
    const imageUpload = document.getElementById('imageUpload');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const originalImageContainer = document.getElementById('originalImageContainer');
    const processedImageContainer = document.getElementById('processedImageContainer');
    
    // Elementi DOM per filtri e controlli
    const contrastSlider = document.getElementById('contrastSlider');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const filterSelect = document.getElementById('filterSelect');
    const sharpnessSlider = document.getElementById('sharpnessSlider');
    const saturationSlider = document.getElementById('saturationSlider');
    const algorithmSelect = document.getElementById('algorithmSelect');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Elementi DOM per valutazione
    const evaluateBtn = document.getElementById('evaluateBtn');
    const resetEvalBtn = document.getElementById('resetEvalBtn');
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    
    // Elementi DOM per controlli UI
    const filterTabs = document.querySelectorAll('.filter-tab');
    const filterPanels = document.querySelectorAll('.filter-panel');
    const evalTabs = document.querySelectorAll('.eval-tab');
    const criteriaPanels = document.querySelectorAll('.criteria-panel');
    const helpButtons = document.querySelectorAll('.help-btn');
    const helpDialog = document.getElementById('helpDialog');
    const helpTitle = document.getElementById('helpTitle');
    const helpText = document.getElementById('helpText');
    const helpImage = document.getElementById('helpImage');
    const closeHelpBtn = document.getElementById('closeHelp');
    
    // Elementi DOM per controlli zoom e misurazione
    const zoomInOriginalBtn = document.getElementById('zoomInOriginal');
    const zoomOutOriginalBtn = document.getElementById('zoomOutOriginal');
    const resetZoomOriginalBtn = document.getElementById('resetZoomOriginal');
    const zoomInProcessedBtn = document.getElementById('zoomInProcessed');
    const zoomOutProcessedBtn = document.getElementById('zoomOutProcessed');
    const resetZoomProcessedBtn = document.getElementById('resetZoomProcessed');
    const toggleMeasureBtn = document.getElementById('toggleMeasure');
    const measureInfo = document.getElementById('measureInfo');
    const measureValue = document.getElementById('measureValue');
    
    // Elementi DOM per le azioni sui report
    const saveReportBtn = document.getElementById('saveReportBtn');
    const printReportBtn = document.getElementById('printReportBtn');
    const historySection = document.getElementById('historySection');
    const historyContainer = document.getElementById('historyContainer');
    
    // Elementi DOM per il modal
    const infoModal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close-modal');
    
    // Variabili globali di stato dell'applicazione
    let appState = {
        originalImage: null,        // Elemento img dell'immagine originale
        processedImage: null,       // Elemento img dell'immagine elaborata
        imageData: null,            // Dati originali dell'immagine (ImageData)
        fileName: '',               // Nome del file caricato
        originalZoom: 1,            // Fattore di zoom dell'immagine originale
        processedZoom: 1,           // Fattore di zoom dell'immagine elaborata
        measureMode: false,         // Modalità di misurazione attiva
        measureLine: null,          // Riferimento alla linea di misurazione
        measureStartPoint: null,    // Punto di inizio della misurazione
        measureEndPoint: null,      // Punto di fine della misurazione
        measureScale: 0.1,          // mm per pixel (valore predefinito)
        currentFilterPreset: {},    // Preset attuale dei filtri
        savedAnalyses: [],          // Storico delle analisi salvate
        currentMetricSystem: 'abcd' // Sistema metrico attuale (abcd, 7point, menzies)
    };

    // ------------------ Inizializzazione dell'applicazione ------------------
    
    // Inizializza i valori di visualizzazione degli slider
    updateSliderValueDisplay(contrastSlider, 'contrastValue');
    updateSliderValueDisplay(brightnessSlider, 'brightnessValue');
    updateSliderValueDisplay(sharpnessSlider, 'sharpnessValue');
    updateSliderValueDisplay(saturationSlider, 'saturationValue');
    
    // Carica le analisi salvate dal localStorage
    loadSavedAnalyses();
    
    // ------------------ Event listeners ------------------
    
    // Gestione caricamento immagine
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Gestione controlli dei filtri
    contrastSlider.addEventListener('input', () => {
        updateSliderValueDisplay(contrastSlider, 'contrastValue');
        applyFilters();
    });
    
    brightnessSlider.addEventListener('input', () => {
        updateSliderValueDisplay(brightnessSlider, 'brightnessValue');
        applyFilters();
    });
    
    sharpnessSlider.addEventListener('input', () => {
        updateSliderValueDisplay(sharpnessSlider, 'sharpnessValue');
        applyFilters();
    });
    
    saturationSlider.addEventListener('input', () => {
        updateSliderValueDisplay(saturationSlider, 'saturationValue');
        applyFilters();
    });
    
    filterSelect.addEventListener('change', applyFilters);
    algorithmSelect.addEventListener('change', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Gestione tab filtri
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchFilterTab(tabName);
        });
    });
    
    // Gestione tab valutazione
    evalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchEvalTab(tabName);
        });
    });
    
    // Gestione pulsanti di aiuto
    helpButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const helpType = btn.getAttribute('data-help');
            showHelpDialog(helpType);
            e.stopPropagation();
        });
    });
    
    closeHelpBtn.addEventListener('click', closeHelpDialog);
    
    // Gestione controlli zoom
    zoomInOriginalBtn.addEventListener('click', () => zoomImage('original', 'in'));
    zoomOutOriginalBtn.addEventListener('click', () => zoomImage('original', 'out'));
    resetZoomOriginalBtn.addEventListener('click', () => resetZoom('original'));
    zoomInProcessedBtn.addEventListener('click', () => zoomImage('processed', 'in'));
    zoomOutProcessedBtn.addEventListener('click', () => zoomImage('processed', 'out'));
    resetZoomProcessedBtn.addEventListener('click', () => resetZoom('processed'));
    
    // Gestione strumento di misurazione
    toggleMeasureBtn.addEventListener('change', toggleMeasurementTool);
    
    // Gestione pulsanti di valutazione
    evaluateBtn.addEventListener('click', evaluateLesion);
    resetEvalBtn.addEventListener('click', resetEvaluation);
    
    // Gestione pulsanti report
    saveReportBtn.addEventListener('click', saveReport);
    printReportBtn.addEventListener('click', printReport);
    
    // Gestione modal
    closeModal.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });
    
    // Chiusura del modal cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.classList.add('hidden');
        }
        if (e.target === helpDialog) {
            closeHelpDialog();
        }
    });
    
    /**
     * Gestisce il caricamento dell'immagine
     * @param {Event} event - Evento di cambio input
     */
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validazione del file
        if (!validateImageFile(file)) {
            showErrorMessage('Seleziona un file immagine valido (JPG, PNG o WebP, max 10MB).');
            return;
        }

        // Mostra l'indicatore di caricamento
        loadingIndicator.classList.remove('hidden');
        
        // Salva il nome del file
        appState.fileName = file.name;

        // Carica l'immagine in modo asincrono
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Reset dei container
            resetImageContainers();
            
            // Reset dello stato dell'applicazione
            resetApplicationState();
            
            // Crea e visualizza l'immagine originale
            createImage(e.target.result)
                .then(img => {
                    // Salva l'immagine nello stato dell'applicazione
                    appState.originalImage = img;
                    
                    // Mostra l'immagine nel container
                    originalImageContainer.appendChild(img);
                    
                    // Crea l'immagine elaborata
                    return createProcessedImage(img);
                })
                .then(() => {
                    // Nascondi l'indicatore di caricamento
                    loadingIndicator.classList.add('hidden');
                    
                    // Mostra la sezione di cronologia se ci sono analisi salvate
                    if (appState.savedAnalyses.length > 0) {
                        historySection.classList.remove('hidden');
                    }
                })
                .catch(error => {
                    console.error('Errore nel caricamento dell\'immagine:', error);
                    showErrorMessage('Si è verificato un errore durante il caricamento dell\'immagine.');
                    loadingIndicator.classList.add('hidden');
                });
        };
        
        reader.onerror = () => {
            showErrorMessage('Si è verificato un errore durante la lettura del file.');
            loadingIndicator.classList.add('hidden');
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Crea una promessa per il caricamento di un'immagine
     * @param {string} src - URL dell'immagine
     * @returns {Promise<HTMLImageElement>} Promessa con l'elemento immagine
     */
    function createImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Impossibile caricare l\'immagine'));
            img.src = src;
        });
    }
    
    /**
     * Valida il file immagine caricato
     * @param {File} file - File da validare
     * @returns {boolean} Risultato della validazione
     */
    function validateImageFile(file) {
        // Verifica il tipo di file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return false;
        }
        
        // Verifica la dimensione del file (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Reimposta i container delle immagini
     */
    function resetImageContainers() {
        originalImageContainer.innerHTML = '';
        processedImageContainer.innerHTML = '';
    }
    
    /**
     * Reimposta lo stato dell'applicazione
     */
    function resetApplicationState() {
        appState.originalImage = null;
        appState.processedImage = null;
        appState.imageData = null;
        appState.originalZoom = 1;
        appState.processedZoom = 1;
        
        // Disattiva la modalità di misurazione
        if (appState.measureMode) {
            toggleMeasureBtn.checked = false;
            toggleMeasurementTool();
        }
        
        // Nascondi i risultati
        resultsSection.classList.add('hidden');
    }
    
    /**
     * Crea l'immagine elaborata per l'analisi
     * @param {HTMLImageElement} img - Immagine originale
     * @returns {Promise} Promessa che si risolve quando l'immagine è elaborata
     */
    function createProcessedImage(img) {
        return new Promise((resolve, reject) => {
            try {
                // Usa un web worker per l'elaborazione se disponibile
                if (window.Worker) {
                    const offscreenCanvas = document.createElement('canvas');
                    const offscreenCtx = offscreenCanvas.getContext('2d');
                    
                    // Imposta dimensioni canvas
                    offscreenCanvas.width = img.width;
                    offscreenCanvas.height = img.height;
                    
                    // Disegna l'immagine originale sul canvas
                    offscreenCtx.drawImage(img, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
                    
                    // Ottiene i dati dell'immagine
                    appState.imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
                    
                    // Crea l'immagine elaborata
                    appState.processedImage = document.createElement('img');
                    
                    // Applica i filtri iniziali
                    applyFilters();
                    
                    resolve();
                } else {
                    // Fallback per browser che non supportano i Web Worker
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Imposta dimensioni canvas
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Disegna l'immagine originale sul canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Ottiene i dati dell'immagine
                    appState.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Crea l'immagine elaborata
                    appState.processedImage = document.createElement('img');
                    
                    // Applica i filtri iniziali
                    applyFilters();
                    
                    resolve();
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Aggiorna la visualizzazione del valore dello slider
     * @param {HTMLInputElement} slider - Elemento slider
     * @param {string} valueId - ID dell'elemento che visualizza il valore
     */
    function updateSliderValueDisplay(slider, valueId) {
        const valueElement = document.getElementById(valueId);
        if (valueElement) {
            valueElement.textContent = `${slider.value}%`;
        }
    }
    
    /**
     * Cambia la tab dei filtri
     * @param {string} tabName - Nome della tab da attivare
     */
    function switchFilterTab(tabName) {
        // Aggiorna la classe attiva delle tabs
        filterTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Mostra il pannello corrispondente
        filterPanels.forEach(panel => {
            if (panel.id === `${tabName}Filters`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }
    
    /**
     * Cambia la tab di valutazione
     * @param {string} tabName - Nome della tab da attivare
     */
    function switchEvalTab(tabName) {
        // Aggiorna la classe attiva delle tabs
        evalTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Mostra il pannello corrispondente
        criteriaPanels.forEach(panel => {
            if (panel.id === `${tabName}Criteria`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Aggiorna il sistema metrico corrente
        appState.currentMetricSystem = tabName;
    }
    
    /**
     * Mostra un messaggio di errore
     * @param {string} message - Messaggio di errore
     */
    function showErrorMessage(message) {
        modalTitle.textContent = 'Errore';
        modalContent.textContent = message;
        infoModal.classList.remove('hidden');
    }
    
    /**
     * Mostra una finestra di dialogo di aiuto
     * @param {string} helpType - Tipo di aiuto da mostrare
     */
    function showHelpDialog(helpType) {
        // Database di aiuto
        const helpData = {
            asymmetry: {
                title: 'Asimmetria',
                text: 'L\'asimmetria è un criterio importante nel metodo ABCD. Una lesione maligna tende ad essere asimmetrica. Valuta l\'asimmetria dividendo mentalmente la lesione in due parti lungo due assi perpendicolari e confronta le metà. Assegna 0 se è simmetrica in entrambi gli assi, 1 se è asimmetrica in un asse, 2 se è asimmetrica in entrambi gli assi.',
                image: 'https://via.placeholder.com/300x200?text=Esempi+di+Asimmetria'
            },
            borders: {
                title: 'Bordi',
                text: 'I bordi di una lesione maligna tendono ad essere irregolari, frastagliati o mal definiti. Valuta i bordi osservando la nitidezza e la regolarità del perimetro della lesione. Assegna 0 se i bordi sono regolari e ben definiti, 1 se sono leggermente irregolari, 2 se sono molto irregolari o sfumati.',
                image: 'https://via.placeholder.com/300x200?text=Esempi+di+Bordi'
            },
            // ... altri tipi di aiuto
        };
        
        // Imposta il contenuto del dialogo
        const help = helpData[helpType] || {
            title: 'Guida',
            text: 'Informazioni non disponibili per questo criterio.',
            image: null
        };
        
        helpTitle.textContent = help.title;
        helpText.textContent = help.text;
        
        // Imposta l'immagine se presente
        if (help.image) {
            helpImage.innerHTML = `<img src="${help.image}" alt="${help.title}">`;
            helpImage.classList.remove('hidden');
        } else {
            helpImage.innerHTML = '';
            helpImage.classList.add('hidden');
        }
        
        // Mostra il dialogo
        helpDialog.classList.remove('hidden');
    }
    
    /**
     * Chiude la finestra di dialogo di aiuto
     */
    function closeHelpDialog() {
        helpDialog.classList.add('hidden');
    }
    
    /**
     * Applica i filtri all'immagine elaborata
     */
    function applyFilters() {
        if (!appState.imageData) return;

        // Ottiene i valori dei filtri
        const contrast = contrastSlider.value / 100;
        const brightness = brightnessSlider.value / 100;
        const sharpness = sharpnessSlider.value / 100;
        const saturation = saturationSlider.value / 100;
        const filterType = filterSelect.value;
        const algorithmType = algorithmSelect.value;

        // Performance: usa requestAnimationFrame per le animazioni fluide
        requestAnimationFrame(() => {
            try {
                // Crea una copia dei dati dell'immagine originale
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { alpha: false }); // ottimizzazione
                canvas.width = appState.imageData.width;
                canvas.height = appState.imageData.height;
                
                // Ottiene una copia dei dati immagine usando un buffer tipizzato per performance
                const newImageData = new ImageData(
                    new Uint8ClampedArray(appState.imageData.data),
                    appState.imageData.width,
                    appState.imageData.height
                );
                
                // Applica contrasto, luminosità e saturazione - ottimizzato con lookup tables
                applyColorAdjustments(newImageData.data, contrast, brightness, saturation);
                
                // Applica filtri specifici per dermoscopia
                switch (filterType) {
                    case 'blue':
                        applyBlueFilter(newImageData.data);
                        break;
                    case 'green':
                        applyGreenFilter(newImageData.data);
                        break;
                    case 'highContrast':
                        applyHighContrastFilter(newImageData.data);
                        break;
                    case 'melanin':
                        applyMelaninFilter(newImageData.data);
                        break;
                    case 'vascular':
                        applyVascularFilter(newImageData.data);
                        break;
                    case 'collagen':
                        applyCollagenFilter(newImageData.data);
                        break;
                }
                
                // Applica algoritmi di rilevamento (se selezionati)
                if (algorithmType !== 'none') {
                    switch (algorithmType) {
                        case 'sobel':
                            applySobelEdgeDetection(newImageData);
                            break;
                        case 'outline':
                            applyLesionOutline(newImageData);
                            break;
                    }
                }
                
                // Applica nitidezza se necessario
                if (sharpness > 0) {
                    applySharpness(newImageData, sharpness);
                }
                
                // Aggiorna l'immagine canvas
                ctx.putImageData(newImageData, 0, 0);
                
                // Aggiorna l'immagine visualizzata
                if (appState.processedImage) {
                    // Se l'immagine esiste già, aggiorna solo la src
                    if (appState.processedImage.parentNode) {
                        appState.processedImage.src = canvas.toDataURL('image/jpeg', 0.9);
                    } else {
                        // Altrimenti, crea una nuova immagine e aggiungila al container
                        appState.processedImage.src = canvas.toDataURL('image/jpeg', 0.9);
                        processedImageContainer.appendChild(appState.processedImage);
                    }
                }
            } catch (error) {
                console.error('Errore nell\'applicazione dei filtri:', error);
                showErrorMessage('Si è verificato un errore durante l\'elaborazione dell\'immagine.');
            }
        });
    }
    
    /**
     * Ottimizzazione: applica regolazioni di colore in un unico passaggio
     * @param {Uint8ClampedArray} data - Dati dell'immagine
     * @param {number} contrast - Valore del contrasto
     * @param {number} brightness - Valore della luminosità
     * @param {number} saturation - Valore della saturazione
     */
    function applyColorAdjustments(data, contrast, brightness, saturation) {
        // Crea lookup tables per ottimizzazione
        const contrastLookup = new Uint8Array(256);
        const factor = (259 * (contrast + 1)) / (255 * (1 - contrast));
        
        for (let i = 0; i < 256; i++) {
            contrastLookup[i] = clamp(factor * (i - 128) + 128);
        }
        
        // Applica tutte le regolazioni in un unico passaggio per efficienza
        for (let i = 0; i < data.length; i += 4) {
            // Applica luminosità e contrasto
            let r = data[i] * brightness;
            let g = data[i + 1] * brightness;
            let b = data[i + 2] * brightness;
            
            r = contrastLookup[clamp(r)];
            g = contrastLookup[clamp(g)];
            b = contrastLookup[clamp(b)];
            
            // Applica saturazione
            if (saturation !== 1) {
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                r = clamp(gray + saturation * (r - gray));
                g = clamp(gray + saturation * (g - gray));
                b = clamp(gray + saturation * (b - gray));
            }
            
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
    }

    /**
     * Applica un filtro blu per migliorare la visibilità di strutture specifiche
     */
    function applyBlueFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            // Aumenta il canale blu e riduce gli altri
            data[i] = data[i] * 0.7;     // Rosso
            data[i + 1] = data[i + 1] * 0.7; // Verde
            data[i + 2] = data[i + 2] * 1.3; // Blu
        }
    }

    /**
     * Applica un filtro verde per migliorare la visibilità di strutture vascolari
     */
    function applyGreenFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            // Aumenta il canale verde e riduce gli altri
            data[i] = data[i] * 0.7;     // Rosso
            data[i + 1] = data[i + 1] * 1.3; // Verde
            data[i + 2] = data[i + 2] * 0.7; // Blu
        }
    }

    /**
     * Applica un filtro ad alto contrasto per migliorare i bordi e le strutture
     */
    function applyHighContrastFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            // Converti in scala di grigi con alto contrasto
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = avg > 128 ? 255 : 0;
            
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
    }

    /**
     * Limita un valore tra 0 e 255
     */
    function clamp(value) {
        return Math.max(0, Math.min(255, value));
    }

    /**
     * Valuta la lesione in base ai criteri selezionati
     */
    function evaluateLesion() {
        // Verifica che sia stata caricata un'immagine
        if (!originalImage) {
            alert('Carica prima un\'immagine.');
            return;
        }

        // Ottiene i valori selezionati
        const asymmetry = getRadioValue('asymmetry');
        const borders = getRadioValue('borders');
        const colors = getRadioValue('colors');
        const structures = getSelectedStructures();

        // Calcola il punteggio totale (versione semplificata del metodo ABCD)
        const totalScore = calculateScore(asymmetry, borders, colors, structures);

        // Genera il report
        generateReport(totalScore, asymmetry, borders, colors, structures);

        // Mostra la sezione dei risultati
        resultsSection.classList.remove('hidden');
    }

    /**
     * Ottiene il valore selezionato da un gruppo di radio button
     */
    function getRadioValue(name) {
        const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
        return selectedRadio ? parseInt(selectedRadio.value) : 0;
    }

    /**
     * Ottiene le strutture dermoscopiche selezionate
     */
    function getSelectedStructures() {
        const checkboxes = document.querySelectorAll('input[name="structures"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Calcola un punteggio semplificato basato sui criteri selezionati
     */
    function calculateScore(asymmetry, borders, colors, structures) {
        // Punteggio base dalle caratteristiche ABCD
        let score = asymmetry + borders + colors;
        
        // Aggiunge punteggio basato su strutture specifiche
        // Strutture che possono indicare malignità
        const suspiciousStructures = ['blueVeil', 'regression', 'vascular'];
        const suspiciousCount = structures.filter(s => suspiciousStructures.includes(s)).length;
        
        score += suspiciousCount;
        
        return score;
    }

    /**
     * Genera un report basato sul punteggio e i criteri
     */
    function generateReport(score, asymmetry, borders, colors, structures) {
        let risk = "basso";
        let recommendation = "Monitoraggio di routine consigliato.";
        
        if (score >= 3 && score <= 4) {
            risk = "moderato";
            recommendation = "Si consiglia una valutazione dermatologica.";
        } else if (score >= 5) {
            risk = "elevato";
            recommendation = "Si consiglia una valutazione dermatologica urgente.";
        }
        
        // Costruisce l'HTML del report
        let html = `
            <div class="report">
                <p><strong>Livello di sospetto:</strong> <span class="risk-level risk-${risk}">${risk.toUpperCase()}</span></p>
                <p><strong>Punteggio totale:</strong> ${score} (su una scala semplificata)</p>
                
                <h4>Criteri di valutazione:</h4>
                <ul>
                    <li>Asimmetria: ${asymmetry}</li>
                    <li>Bordi: ${borders}</li>
                    <li>Variazione di colore: ${colors}</li>
                </ul>
                
                <h4>Strutture dermoscopiche identificate:</h4>
                <ul>
        `;
        
        if (structures.length === 0) {
            html += '<li>Nessuna struttura selezionata</li>';
        } else {
            // Mappa dei nomi delle strutture
            const structureNames = {
                'network': 'Rete pigmentata',
                'globules': 'Globuli',
                'streaks': 'Strie',
                'blueVeil': 'Velo blu-biancastro',
                'regression': 'Aree di regressione',
                'vascular': 'Strutture vascolari atipiche'
            };
            
            structures.forEach(s => {
                html += `<li>${structureNames[s]}</li>`;
            });
        }
        
        html += `
                </ul>
                
                <h4>Raccomandazione:</h4>
                <p>${recommendation}</p>
                
                <div class="disclaimer-note">
                    <p><strong>Nota:</strong> Questa è un'analisi semplificata basata sui criteri selezionati manualmente. 
                    Non è un sistema diagnostico certificato. Consultare sempre un dermatologo per una diagnosi accurata.</p>
                </div>
            </div>
        `;
        
        // Aggiunge lo stile CSS inline per il report
        html += `
            <style>
                .report {
                    line-height: 1.6;
                }
                .risk-level {
                    font-weight: bold;
                    padding: 2px 8px;
                    border-radius: 3px;
                }
                .risk-basso {
                    background-color: #c8e6c9;
                    color: #2e7d32;
                }
                .risk-moderato {
                    background-color: #fff9c4;
                    color: #f57f17;
                }
                .risk-elevato {
                    background-color: #ffcdd2;
                    color: #c62828;
                }
                .report ul {
                    margin-left: 20px;
                    margin-bottom: 15px;
                }
                .disclaimer-note {
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-left: 3px solid #3498db;
                    font-size: 0.9rem;
                }
            </style>
        `;
        
        // Aggiorna il contenuto dei risultati
        resultsContent.innerHTML = html;
    }
});
