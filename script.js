document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const imageUpload = document.getElementById('imageUpload');
    const originalImageContainer = document.getElementById('originalImageContainer');
    const processedImageContainer = document.getElementById('processedImageContainer');
    const contrastSlider = document.getElementById('contrastSlider');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const filterSelect = document.getElementById('filterSelect');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');

    // Variabili globali
    let originalImage = null;
    let processedImage = null;
    let imageData = null;

    // Gestisce il caricamento dell'immagine
    imageUpload.addEventListener('change', handleImageUpload);

    // Gestisce i cambiamenti nei controlli dei filtri
    contrastSlider.addEventListener('input', applyFilters);
    brightnessSlider.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);

    // Gestisce la valutazione
    evaluateBtn.addEventListener('click', evaluateLesion);

    /**
     * Gestisce il caricamento dell'immagine
     */
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Controlla che sia un'immagine
        if (!file.type.match('image.*')) {
            alert('Seleziona un file immagine valido.');
            return;
        }

        // Crea un URL per l'immagine caricata
        const reader = new FileReader();
        reader.onload = (e) => {
            // Rimuove il testo placeholder
            originalImageContainer.innerHTML = '';
            processedImageContainer.innerHTML = '';

            // Crea e visualizza l'immagine originale
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = () => {
                originalImageContainer.appendChild(originalImage);
                
                // Crea l'immagine elaborata
                createProcessedImage(originalImage);
            };
        };
        reader.readAsDataURL(file);
    }

    /**
     * Crea l'immagine elaborata per l'analisi
     */
    function createProcessedImage(img) {
        // Crea un canvas per elaborare l'immagine
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Imposta dimensioni canvas
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Disegna l'immagine originale sul canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Ottiene i dati dell'immagine
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Crea l'immagine elaborata
        processedImage = document.createElement('img');
        
        // Applica i filtri iniziali
        applyFilters();
    }

    /**
     * Applica i filtri all'immagine elaborata
     */
    function applyFilters() {
        if (!imageData) return;

        // Ottiene i valori dei filtri
        const contrast = contrastSlider.value / 100;
        const brightness = brightnessSlider.value / 100;
        const filterType = filterSelect.value;

        // Crea una copia dei dati dell'immagine originale
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        
        // Ottiene una copia dei dati immagine
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        // Applica contrasto e luminosità
        const data = newImageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // Valori RGB
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Applica luminosità
            const brightR = r * brightness;
            const brightG = g * brightness;
            const brightB = b * brightness;
            
            // Applica contrasto
            const factor = (259 * (contrast + 1)) / (255 * (1 - contrast));
            data[i] = clamp(factor * (brightR - 128) + 128);
            data[i + 1] = clamp(factor * (brightG - 128) + 128);
            data[i + 2] = clamp(factor * (brightB - 128) + 128);
        }
        
        // Applica filtri specifici per dermoscopia
        switch (filterType) {
            case 'blue':
                applyBlueFilter(data);
                break;
            case 'green':
                applyGreenFilter(data);
                break;
            case 'highContrast':
                applyHighContrastFilter(data);
                break;
        }
        
        // Aggiorna l'immagine canvas
        ctx.putImageData(newImageData, 0, 0);
        
        // Aggiorna l'immagine visualizzata
        if (processedImage.parentNode) {
            processedImage.src = canvas.toDataURL();
        } else {
            processedImage.src = canvas.toDataURL();
            processedImageContainer.appendChild(processedImage);
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
