// Regular refinement rates (EXACT from table)
const REGULAR_REFINEMENT = {
    0: { success: 100, fail: 0, downgrade: 0, break: 0 },
    1: { success: 50, fail: 50, downgrade: 0, break: 0 },
    2: { success: 33, fail: 67, downgrade: 0, break: 0 },
    3: { success: 25, fail: 75, downgrade: 0, break: 0 },
    4: { success: 25, fail: 40, downgrade: 25, break: 10 },
    5: { success: 25, fail: 40, downgrade: 25, break: 10 },
    6: { success: 20, fail: 40, downgrade: 25, break: 15 },
    7: { success: 20, fail: 40, downgrade: 25, break: 15 },
    8: { success: 20, fail: 35, downgrade: 30, break: 15 },
    9: { success: 20, fail: 35, downgrade: 30, break: 15 },
    10: { success: 20, fail: 30, downgrade: 30, break: 20 },
    11: { success: 20, fail: 30, downgrade: 30, break: 20 },
    12: { success: 20, fail: 25, downgrade: 30, break: 25 },
    13: { success: 15, fail: 20, downgrade: 35, break: 30 },
    14: { success: 15, fail: 15, downgrade: 35, break: 35 }
};

const SAFE_REFINEMENT = {
    0: { success: 100, fail: 0, break: 0 },
    1: { success: 100, fail: 0, break: 0 },
    2: { success: 100, fail: 0, break: 0 },
    3: { success: 100, fail: 0, break: 0 },
    4: { success: 20, fail: 60, break: 20 },
    5: { success: 13.33, fail: 61.67, break: 25 },
    6: { success: 10, fail: 60, break: 30 },
    7: { success: 6.67, fail: 58.33, break: 35 },
    8: { success: 5, fail: 55, break: 40 },
    9: { success: 3.33, fail: 51.67, break: 45 },
    10: { success: 2.5, fail: 47.5, break: 50 },
    11: { success: 1.67, fail: 43.33, break: 55 },
    12: { success: 1.25, fail: 38.75, break: 60 },
    13: { success: 0.83, fail: 34.17, break: 65 },
    14: { success: 0.63, fail: 29.38, break: 70 }
};

// DOM Elements
const equipmentTypeSelect = document.getElementById('equipment-type');
const equipmentLevelSelect = document.getElementById('equipment-level');
const currentLevelSpan = document.getElementById('current-level');
const successRateSpan = document.getElementById('success-rate');
const failRateSpan = document.getElementById('fail-rate');
const downgradeRateSpan = document.getElementById('downgrade-rate');
const breakRateSpan = document.getElementById('break-rate');
const failRateBox = document.getElementById('fail-rate-box');
const downgradeRateBox = document.getElementById('downgrade-rate-box');
const breakRateBox = document.getElementById('break-rate-box');
const refineButton = document.getElementById('refine-button');
const resetButton = document.getElementById('reset-button');
const historyList = document.getElementById('refine-history');
const refineTypeRadios = document.getElementsByName('refine-type');
const safeRefineRadio = document.getElementById('safe-refine-radio');
const regularRefineRadio = document.getElementById('regular-refine-radio');
const weaponTypeSelect = document.getElementById('weapon-type');
const raritySelect = document.getElementById('rarity-select');

// Notification Element
let notificationBox = document.getElementById('notification-box');
if (!notificationBox) {
    notificationBox = document.createElement('div');
    notificationBox.id = 'notification-box';
    notificationBox.style.display = 'none';
    notificationBox.style.position = 'fixed';
    notificationBox.style.top = '80px';
    notificationBox.style.left = '50%';
    notificationBox.style.transform = 'translateX(-50%)';
    notificationBox.style.background = '#e74c3c';
    notificationBox.style.color = 'white';
    notificationBox.style.padding = '1rem 2rem';
    notificationBox.style.borderRadius = '8px';
    notificationBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    notificationBox.style.zIndex = '9999';
    notificationBox.style.fontWeight = 'bold';
    document.body.appendChild(notificationBox);
}

// State variables
let currentRefineLevel = 0;
let selectedEquipmentType = '';
let selectedEquipmentLevel = '';
let selectedRefineType = 'regular';
let selectedWeaponType = '';
let selectedRarity = '';
let sessionMaterials = {};
let sessionTotal = 0;
let lastEquipmentType = '';

// Event Listeners
refineTypeRadios.forEach(radio => {
    radio.addEventListener('change', updateRefineChance);
});
equipmentTypeSelect.addEventListener('change', function() {
    updateRarityOptions();
    updateDropdownStates();
    // Reset refine level to 0
    currentRefineLevel = 0;
    equipmentLevelSelect.value = '1';
    currentLevelSpan.textContent = currentRefineLevel;
    lastEquipmentType = equipmentTypeSelect.value;
    updateRefineChance();
    if (equipmentTypeSelect.value === 'weapon') {
        weaponTypeSelect.style.display = '';
    } else {
        weaponTypeSelect.style.display = 'none';
        weaponTypeSelect.value = '';
        selectedWeaponType = '';
    }
});
weaponTypeSelect.addEventListener('change', function() {
    selectedWeaponType = weaponTypeSelect.value;
    updateDropdownStates();
    // Only reset to 0 if equipment type did not change
    if (equipmentTypeSelect.value === lastEquipmentType) {
        currentRefineLevel = 0;
        equipmentLevelSelect.value = '1';
        currentLevelSpan.textContent = currentRefineLevel;
    }
    updateRefineChance();
});
raritySelect.addEventListener('change', function() {
    selectedRarity = raritySelect.value;
    updateDropdownStates();
    // Only reset to 0 if equipment type did not change
    if (equipmentTypeSelect.value === lastEquipmentType) {
        currentRefineLevel = 0;
        equipmentLevelSelect.value = '1';
        currentLevelSpan.textContent = currentRefineLevel;
    }
    updateRefineChance();
});
equipmentLevelSelect.addEventListener('change', function() {
    selectedEquipmentLevel = equipmentLevelSelect.value;
    if (selectedEquipmentLevel) {
        currentRefineLevel = parseInt(selectedEquipmentLevel, 10);
        currentLevelSpan.textContent = currentRefineLevel;
        // Update the weapon image and the displayed refine level
        updateWeaponImage();
        updateRefineLevel(false);
    }
    updateRefineChance();
});
refineButton.addEventListener('click', function() {
    // Check if all equipment options are selected
    let allSelected = selectedEquipmentType && selectedEquipmentLevel && selectedRarity;
    if (selectedEquipmentType === 'weapon') {
        allSelected = allSelected && selectedWeaponType;
    }
    
    if (!allSelected) {
        // Show notification if equipment is not fully selected
        showNotification('Please select equipment type, weapon type, rarity, and level first');
        return;
    }
    
    // Proceed with refinement
    attemptRefine();
});
resetButton.addEventListener('click', resetSimulator);

// Collapsible Material Prices section
const togglePriceBtn = document.getElementById('toggle-price-section');
const priceSectionContent = document.getElementById('price-section-content');
const togglePriceIcon = document.getElementById('toggle-price-icon');

togglePriceBtn.addEventListener('click', function() {
    const expanded = togglePriceBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) {
        // Erst Höhe auf 0 setzen, dann nach kurzer Verzögerung ausblenden
        priceSectionContent.style.maxHeight = '0';
        setTimeout(() => {
            priceSectionContent.style.display = 'none';
        }, 300);
        togglePriceBtn.setAttribute('aria-expanded', 'false');
        togglePriceIcon.textContent = '▶';
    } else {
        // Erst einblenden, dann nach kurzer Verzögerung die Höhe setzen
        priceSectionContent.style.display = '';
        setTimeout(() => {
            // Setze große max-height für Animation
            priceSectionContent.style.maxHeight = '4000px';
        }, 10);
        togglePriceBtn.setAttribute('aria-expanded', 'true');
        togglePriceIcon.textContent = '▼';
    }
});

// Range Simulator toggle logic
const rangeSimToggle = document.getElementById('range-sim-toggle');
const rangeSimSection = document.getElementById('range-simulator-section');
rangeSimToggle.addEventListener('change', function() {
    rangeSimSection.style.display = this.checked ? '' : 'none';
});

// Range Simulator basic simulation logic
const rangeSimBtn = document.getElementById('range-simulate-btn');
const rangeSimResult = document.getElementById('range-sim-result');
rangeSimBtn.addEventListener('click', function() {
    const start = parseInt(document.getElementById('range-start-level').value, 10);
    const end = parseInt(document.getElementById('range-end-level').value, 10);
    const runMultiple = document.getElementById('run-multiple-sims').checked;
    const numSimulations = runMultiple ? 1000 : 1;

    if (isNaN(start) || isNaN(end) || end <= start) {
        rangeSimResult.innerHTML = '<span style="color:red;">End Level must be greater than Start Level.</span>';
        return;
    }

    // Prepare simulation state
    let totalAttempts = 0;
    let totalSuccess = 0;
    let totalFail = 0;
    let totalBreak = 0;
    let totalDowngrade = 0;
    let totalBlessed = 0;
    let totalMaterials = {};
    let totalCost = 0;
    let totalBlessedStones = {};

    // Run simulations
    for (let sim = 0; sim < numSimulations; sim++) {
        let simLevel = start;
        let simSuccess = 0, simFail = 0, simBreak = 0, simDowngrade = 0, simBlessed = 0;
        let simMaterials = {};
        let simTotal = 0;
        let simBlessedStones = {};
        const blessedChecked = document.getElementById('blessed-stone-checkbox').checked;
        const refineType = document.querySelector('input[name="refine-type"]:checked').value;

        // Helper for blessed stone type
        function getSimBlessedStoneType(level, material) {
            if (material === 'Oridecon') {
                if (level >= 5 && level <= 8) return 'Blessed Oridecon I';
                if (level >= 9 && level <= 12) return 'Blessed Oridecon II';
                if (level >= 13 && level <= 15) return 'Blessed Oridecon III';
            } else if (material === 'Elunium') {
                if (level >= 5 && level <= 8) return 'Blessed Elunium I';
                if (level >= 9 && level <= 12) return 'Blessed Elunium II';
                if (level >= 13 && level <= 15) return 'Blessed Elunium III';
            } else if (material === 'Bradium') {
                if (level >= 5 && level <= 8) return 'Blessed Bradium I';
                if (level >= 9 && level <= 12) return 'Blessed Bradium II';
                if (level >= 13 && level <= 15) return 'Blessed Bradium III';
            }
            return null;
        }
        function getSimBlessedStoneAmount() {
            if (selectedEquipmentType === 'weapon') {
                let base = 0;
                if (selectedRarity === 'gold') base = 24;
                else if (selectedRarity === 'blue') base = 12;
                else if (selectedRarity === 'white') base = 8;
                if (selectedWeaponType === 'one-handed') base = Math.ceil(base * 2/3);
                else if (selectedWeaponType === 'dagger') base = Math.ceil(base * 2/3);
                else if (selectedWeaponType === 'shield') base = Math.ceil(base * 1/3);
                return base;
            }
            if (selectedEquipmentType === 'armor') {
                if (selectedRarity === 'purple' || selectedRarity === 'gold') return 8;
                if (selectedRarity === 'blue') return 4;
                if (selectedRarity === 'white') return 2;
            }
            if (selectedEquipmentType === 'accessory') {
                if (selectedRarity === 'gold') return 8;
                if (selectedRarity === 'blue') return 4;
                if (selectedRarity === 'white') return 2;
            }
            return 0;
        }
        // Helper for material info at a given level
        function getSimMaterialInfo(level) {
            // Copy of getMaterialInfo, but for a given level
            let material = '';
            if (selectedEquipmentType === 'weapon') material = 'Oridecon';
            else if (selectedEquipmentType === 'accessory') material = 'Bradium';
            else if (selectedEquipmentType === 'armor') material = 'Elunium';
            else return null;
            let base = 0, enriched = 0, hd = 0, uhd = 0;
            if (level >= 0 && level < 2) base = 6;
            else if (level >= 2 && level < 4) base = 12;
            else if (level >= 4 && level < 6) enriched = 6;
            else if (level >= 6 && level < 8) enriched = 12;
            else if (level >= 8 && level < 10) hd = 6;
            else if (level >= 10 && level < 12) hd = 12;
            else if (level >= 12 && level < 14) uhd = 6;
            else if (level >= 14 && level < 15) uhd = 12;
            let rarityMult = 1;
            if (selectedEquipmentType === 'weapon') {
                if (selectedRarity === 'blue') rarityMult = 2;
                else if (selectedRarity === 'gold') rarityMult = 4;
            }
            let typeMult = 1;
            if (selectedEquipmentType === 'weapon') {
                if (selectedWeaponType === 'one-handed') typeMult = 0.5;
                else if (selectedWeaponType === 'dagger') typeMult = 2/3;
                else if (selectedWeaponType === 'shield') typeMult = 1/3;
            }
            if (selectedEquipmentType === 'armor' || selectedEquipmentType === 'accessory') {
                if (selectedRarity === 'gold' || selectedRarity === 'purple') base = 8;
                else if (selectedRarity === 'blue') base = 4;
                else if (selectedRarity === 'white') base = 2;
                enriched = hd = uhd = 0;
                rarityMult = 1;
                typeMult = 1;
            } else {
                base = Math.ceil(base * typeMult * rarityMult);
                enriched = Math.ceil(enriched * typeMult * rarityMult);
                hd = Math.ceil(hd * typeMult * rarityMult);
                uhd = Math.ceil(uhd * typeMult * rarityMult);
            }
            const priceBase = Number(document.getElementById('price-' + material.toLowerCase()).value) || 0;
            const priceEnriched = Number(document.getElementById('price-enriched-' + material.toLowerCase()).value) || 0;
            const priceHD = Number(document.getElementById('price-hd-' + material.toLowerCase()).value) || 0;
            const priceUHD = Number(document.getElementById('price-uhd-' + material.toLowerCase()).value) || 0;
            const total = base * priceBase + enriched * priceEnriched + hd * priceHD + uhd * priceUHD;
            return { material, base, enriched, hd, uhd, total };
        }
        // Helper for blessed stone price
        function getSimBlessedStonePrice(type, material) {
            if (!type) return 0;
            let id = '';
            if (type.endsWith('I')) id = '1';
            else if (type.endsWith('II')) id = '2';
            else if (type.endsWith('III')) id = '3';
            return Number(document.getElementById('price-blessed' + material.toLowerCase() + id).value) || 0;
        }
        // Helper for Protection Stone type
        function getSimProtectionStoneType(level, material) {
            if (selectedEquipmentType === 'weapon') {
                if (level >= 4 && level <= 7) return 'Weapon Protection Stone I';
                if (level >= 8 && level <= 11) return 'Weapon Protection Stone II';
                if (level >= 12 && level <= 15) return 'Weapon Protection Stone III';
            }
            if (selectedEquipmentType === 'armor') {
                if (level >= 4 && level <= 7) return 'Armor Protection Stone I';
                if (level >= 8 && level <= 11) return 'Armor Protection Stone II';
                if (level >= 12 && level <= 15) return 'Armor Protection Stone III';
            }
            if (selectedEquipmentType === 'accessory') {
                if (level >= 4 && level <= 7) return 'Accessory Protection Stone I';
                if (level >= 8 && level <= 11) return 'Accessory Protection Stone II';
                if (level >= 12 && level <= 15) return 'Accessory Protection Stone III';
            }
            return null;
        }
        function getSimProtectionStonePrice(type, material) {
            if (!type) return 0;
            let id = '';
            if (type.endsWith('I')) id = '1';
            else if (type.endsWith('II')) id = '2';
            else if (type.endsWith('III')) id = '3';
            let prefix = '';
            if (type.startsWith('Weapon')) prefix = 'weaponprotectionstone';
            else if (type.startsWith('Armor')) prefix = 'armorprotectionstone';
            else if (type.startsWith('Accessory')) prefix = 'accessoryprotectionstone';
            return Number(document.getElementById('price-' + prefix + id).value) || 0;
        }
        // Simulate
        let simAttempts = 0;
        let simLevelCurrent = start;
        while (simLevelCurrent < end) {
            simAttempts++;
            // Get rates for this level
            let rates = (refineType === 'regular') ? REGULAR_REFINEMENT[simLevelCurrent] : SAFE_REFINEMENT[simLevelCurrent];
            // Get material info for this level
            let minfo = getSimMaterialInfo(simLevelCurrent);
            // Add materials
            function addSimMat(mat, qty, price) {
                if (!qty) return;
                if (!simMaterials[mat]) simMaterials[mat] = { qty: 0, cost: 0 };
                simMaterials[mat].qty += qty;
                simMaterials[mat].cost += qty * price;
                simTotal += qty * price;
            }
            addSimMat(minfo.material, minfo.base, Number(document.getElementById('price-' + minfo.material.toLowerCase()).value) || 0);
            addSimMat('Enriched ' + minfo.material, minfo.enriched, Number(document.getElementById('price-enriched-' + minfo.material.toLowerCase()).value) || 0);
            addSimMat('HD ' + minfo.material, minfo.hd, Number(document.getElementById('price-hd-' + minfo.material.toLowerCase()).value) || 0);
            addSimMat('UHD ' + minfo.material, minfo.uhd, Number(document.getElementById('price-uhd-' + minfo.material.toLowerCase()).value) || 0);
            // Simulate outcome
            const rand = Math.random() * 100;
            let outcome = '';
            let wouldBreak = false;
            let blessedStoneType = null;
            let blessedMaterial = minfo.material;
            if (refineType === 'regular') {
                if (rand < rates.success) {
                    outcome = 'success';
                    simSuccess++;
                    simLevelCurrent++;
                } else if (rand < rates.success + rates.fail) {
                    outcome = 'fail';
                    simFail++;
                } else if (rates.downgrade && rand < rates.success + rates.fail + rates.downgrade) {
                    outcome = 'downgrade';
                    simDowngrade++;
                    simLevelCurrent = Math.max(0, simLevelCurrent - 1);
                } else if (rates.break && rand < rates.success + rates.fail + (rates.downgrade || 0) + rates.break) {
                    wouldBreak = true;
                    if (blessedChecked) {
                        blessedStoneType = getSimBlessedStoneType(simLevelCurrent, blessedMaterial);
                        if (blessedStoneType) {
                            let qty = getSimBlessedStoneAmount();
                            if (!simBlessedStones[blessedStoneType]) simBlessedStones[blessedStoneType] = { qty: 0, cost: 0 };
                            simBlessedStones[blessedStoneType].qty += qty;
                            simBlessedStones[blessedStoneType].cost += qty * getSimBlessedStonePrice(blessedStoneType, blessedMaterial);
                            simTotal += qty * getSimBlessedStonePrice(blessedStoneType, blessedMaterial);
                            simBlessed++;
                        } else {
                            outcome = 'break';
                            simBreak++;
                        }
                    } else {
                        outcome = 'break';
                        simBreak++;
                    }
                }
            } else {
                // Always add Protection Stones for safe refining if level >= 4
                const protectType = getSimProtectionStoneType(simLevelCurrent, blessedMaterial);
                // Calculate protection stone quantity - same as the base material amount
                let protectQty = 0;
                const minfo = getSimMaterialInfo(simLevelCurrent);
                if (minfo) {
                    protectQty = minfo.base + minfo.enriched + minfo.hd + minfo.uhd;
                }
                
                if (protectType && protectQty > 0) {
                    if (!simBlessedStones[protectType]) simBlessedStones[protectType] = { qty: 0, cost: 0 };
                    const protectPrice = getSimProtectionStonePrice(protectType, blessedMaterial);
                    simBlessedStones[protectType].qty += protectQty;
                    simBlessedStones[protectType].cost += protectQty * protectPrice;
                    simTotal += protectQty * protectPrice;
                }
                
                // Additional Blessed Stones if checkbox is checked
                if (blessedChecked && simLevelCurrent >= 5) {
                    blessedStoneType = getSimBlessedStoneType(simLevelCurrent, blessedMaterial);
                    if (blessedStoneType) {
                        let qty = getSimBlessedStoneAmount();
                        if (!simBlessedStones[blessedStoneType]) simBlessedStones[blessedStoneType] = { qty: 0, cost: 0 };
                        simBlessedStones[blessedStoneType].qty += qty;
                        simBlessedStones[blessedStoneType].cost += qty * getSimBlessedStonePrice(blessedStoneType, blessedMaterial);
                        simTotal += qty * getSimBlessedStonePrice(blessedStoneType, blessedMaterial);
                        simBlessed++;
                    }
                }
                
                if (rand < rates.success) {
                    outcome = 'success';
                    simSuccess++;
                    simLevelCurrent++;
                } else if (rand < rates.success + rates.fail) {
                    outcome = 'fail';
                    simFail++;
                } else if (rates.break && rand < rates.success + rates.fail + rates.break) {
                    wouldBreak = true;
                    if (blessedChecked) {
                        blessedStoneType = getSimBlessedStoneType(simLevelCurrent, blessedMaterial);
                        if (blessedStoneType) {
                            result = 'Saved by Blessed & Protection Stone';
                            colorClass = 'blessed';
                            blessedStoneUsed = true;
                        } else {
                            result = 'Break';
                            colorClass = 'break';
                            broke = true;
                        }
                    } else {
                        result = 'Break';
                        colorClass = 'break';
                        broke = true;
                    }
                }
            }
            // Prevent infinite loop
            if (simAttempts > 10000) break;
        }
        // Add to totals
        totalAttempts += simAttempts;
        totalSuccess += simSuccess;
        totalFail += simFail;
        totalBreak += simBreak;
        totalDowngrade += simDowngrade;
        totalBlessed += simBlessed;
        totalCost += simTotal;
        // Add materials to total
        for (const [mat, data] of Object.entries(simMaterials)) {
            if (!totalMaterials[mat]) totalMaterials[mat] = { qty: 0, cost: 0 };
            totalMaterials[mat].qty += data.qty;
            totalMaterials[mat].cost += data.cost;
        }
        // Add blessed stones to total
        for (const [mat, data] of Object.entries(simBlessedStones)) {
            if (!totalBlessedStones[mat]) totalBlessedStones[mat] = { qty: 0, cost: 0 };
            totalBlessedStones[mat].qty += data.qty;
            totalBlessedStones[mat].cost += data.cost;
        }
    }
    // Calculate averages
    const avgAttempts = Math.round(totalAttempts / numSimulations);
    const avgSuccess = Math.round(totalSuccess / numSimulations);
    const avgFail = Math.round(totalFail / numSimulations);
    const avgBreak = Math.round(totalBreak / numSimulations);
    const avgDowngrade = Math.round(totalDowngrade / numSimulations);
    const avgBlessed = Math.round(totalBlessed / numSimulations);
    const avgCost = Math.round(totalCost / numSimulations);

    // Update session materials with simulated results
    sessionMaterials = {};
    sessionTotal = 0;

    // Add average materials to session
    for (const [mat, data] of Object.entries(totalMaterials)) {
        const avgQty = Math.round(data.qty / numSimulations);
        const avgCost = Math.round(data.cost / numSimulations);
        if (avgQty > 0) {
            sessionMaterials[mat] = { qty: avgQty, cost: avgCost };
            sessionTotal += avgCost;
        }
    }

    // Add average blessed stones to session
    for (const [mat, data] of Object.entries(totalBlessedStones)) {
        const avgQty = Math.round(data.qty / numSimulations);
        const avgCost = Math.round(data.cost / numSimulations);
        if (avgQty > 0) {
            sessionMaterials[mat] = { qty: avgQty, cost: avgCost };
            sessionTotal += avgCost;
        }
    }

    // Update session summary box
    updateSessionSummaryBox();

    // Output result
    let html = `<strong>${runMultiple ? 'Average of 1000 simulations' : 'Single simulation'} from +${start} to +${end}</strong><br>`;
    html += `<ul style='margin:0.5rem 0;'>`;
    html += `<li>Attempts: <strong>${avgAttempts}</strong></li>`;
    html += `<li>Success: <strong>${avgSuccess}</strong></li>`;
    html += `<li>Fails: <strong>${avgFail}</strong></li>`;
    html += `<li>Downgrades: <strong>${avgDowngrade}</strong></li>`;
    html += `<li>Breaks: <strong>${avgBreak}</strong></li>`;
    html += `<li>Blessed Stones used: <strong>${avgBlessed}</strong></li>`;
    html += `</ul>`;
    html += `<div style='margin:0.5rem 0;'><strong>Average Materials Used:</strong><ul style='margin:0.2rem 0;'>`;
    
    // Calculate and display average materials
    for (const [mat, data] of Object.entries(totalMaterials)) {
        const avgQty = Math.round(data.qty / numSimulations);
        const avgCost = Math.round(data.cost / numSimulations);
        if (avgQty > 0) html += `<li>${mat}: ${avgQty} × <span style='color:#888;'>${avgCost.toLocaleString()} Crystals</span></li>`;
    }
    
    // Calculate and display average blessed stones
    for (const [mat, data] of Object.entries(totalBlessedStones)) {
        const avgQty = Math.round(data.qty / numSimulations);
        const avgCost = Math.round(data.cost / numSimulations);
        if (avgQty > 0) html += `<li>${mat}: ${avgQty} × <span style='color:#888;'>${avgCost.toLocaleString()} Crystals</span></li>`;
    }
    
    html += `</ul></div>`;
    html += `<div class='total-row'>Average Cost: <span>${avgCost.toLocaleString()} Crystals</span></div>`;
    rangeSimResult.innerHTML = html;
});

// Functions
function getRates() {
    if (selectedRefineType === 'regular') {
        return REGULAR_REFINEMENT[currentRefineLevel] || { success: 0, fail: 0, downgrade: 0, break: 0 };
    } else {
        return SAFE_REFINEMENT[currentRefineLevel] || { success: 0, fail: 0, break: 0 };
    }
}

function getMaterialInfo() {
    // Determine material type
    let material = '';
    if (selectedEquipmentType === 'weapon') material = 'Oridecon';
    else if (selectedEquipmentType === 'accessory') material = 'Bradium';
    else if (selectedEquipmentType === 'armor') material = 'Elunium';
    else return null;

    // Determine base amount by refine level (white 2H weapon as base)
    const lvl = currentRefineLevel;
    let base = 0, enriched = 0, hd = 0, uhd = 0;
    if (lvl >= 0 && lvl < 2) base = 6;
    else if (lvl >= 2 && lvl < 4) base = 12;
    else if (lvl >= 4 && lvl < 6) enriched = 6;
    else if (lvl >= 6 && lvl < 8) enriched = 12;
    else if (lvl >= 8 && lvl < 10) hd = 6;
    else if (lvl >= 10 && lvl < 12) hd = 12;
    else if (lvl >= 12 && lvl < 14) uhd = 6;
    else if (lvl >= 14 && lvl < 15) uhd = 12;

    // Rarity multiplier for weapons
    let rarityMult = 1;
    if (selectedEquipmentType === 'weapon') {
        if (selectedRarity === 'blue') rarityMult = 2;
        else if (selectedRarity === 'gold') rarityMult = 4;
    }
    // Weapon type multiplier
    let typeMult = 1;
    if (selectedEquipmentType === 'weapon') {
        if (selectedWeaponType === 'one-handed') typeMult = 2/3;
        else if (selectedWeaponType === 'dagger') typeMult = 2/3;
        else if (selectedWeaponType === 'shield') typeMult = 1/3;
    }
    // Armor/Accessory: always 1/3 of 2H weapon base, with fixed values for rarity
    if (selectedEquipmentType === 'armor' || selectedEquipmentType === 'accessory') {
        if (selectedRarity === 'gold' || selectedRarity === 'purple') base = 8;
        else if (selectedRarity === 'blue') base = 4;
        else if (selectedRarity === 'white') base = 2;
        enriched = hd = uhd = 0; // Only base material for armor/accessory
        rarityMult = 1; // already handled above
        typeMult = 1; // no further multiplier
    } else {
        // For weapons, apply multipliers
        base = Math.ceil(base * typeMult * rarityMult);
        enriched = Math.ceil(enriched * typeMult * rarityMult);
        hd = Math.ceil(hd * typeMult * rarityMult);
        uhd = Math.ceil(uhd * typeMult * rarityMult);
    }
    // Get prices
    const priceBase = Number(document.getElementById('price-' + material.toLowerCase()).value) || 0;
    const priceEnriched = Number(document.getElementById('price-enriched-' + material.toLowerCase()).value) || 0;
    const priceHD = Number(document.getElementById('price-hd-' + material.toLowerCase()).value) || 0;
    const priceUHD = Number(document.getElementById('price-uhd-' + material.toLowerCase()).value) || 0;
    // Calculate total price
    const total = base * priceBase + enriched * priceEnriched + hd * priceHD + uhd * priceUHD;
    return { material, base, enriched, hd, uhd, total };
}

function updateMaterialCostInfo() {
    const info = getMaterialInfo();
    const box = document.getElementById('material-cost-info');
    if (!info || (!info.base && !info.enriched && !info.hd && !info.uhd)) {
        box.style.display = 'none';
        box.innerHTML = '';
        return;
    }
    let html = `<strong>Per attempt:</strong> `;
    if (info.base) html += `${info.base} ${info.material}`;
    if (info.enriched) html += `${info.base ? ', ' : ''}${info.enriched} Enriched ${info.material}`;
    if (info.hd) html += `${(info.base || info.enriched) ? ', ' : ''}${info.hd} HD ${info.material}`;
    if (info.uhd) html += `${(info.base || info.enriched || info.hd) ? ', ' : ''}${info.uhd} UHD ${info.material}`;
    html += ` <br><strong>Total: ${info.total.toLocaleString()} Crystals</strong>`;
    box.innerHTML = html;
    box.style.display = '';
}

function updateRefineChance() {
    selectedEquipmentType = equipmentTypeSelect.value;
    selectedEquipmentLevel = equipmentLevelSelect.value;
    selectedRefineType = document.querySelector('input[name="refine-type"]:checked').value;

    // Safe Refine erst ab Level 4 aktivierbar
    if (currentRefineLevel < 4) {
        safeRefineRadio.disabled = true;
        regularRefineRadio.checked = true;
    } else {
        safeRefineRadio.disabled = false;
    }

    const rates = getRates();
    successRateSpan.textContent = rates.success + '%';
    failRateSpan.textContent = (rates.fail || 0) + '%';
    downgradeRateSpan.textContent = (rates.downgrade || 0) + '%';
    breakRateSpan.textContent = (rates.break || 0) + '%';

    // Show/hide boxes
    failRateBox.style.display = rates.fail ? '' : 'none';
    downgradeRateBox.style.display = rates.downgrade > 0 ? '' : 'none';
    breakRateBox.style.display = rates.break > 0 ? '' : 'none';

    // Always enable refine button, validation will be done on click
    refineButton.disabled = false;

    // Zeige Refine-Section und History nur wenn alles ausgewählt
    let allSelected = selectedEquipmentType && selectedEquipmentLevel && selectedRarity;
    if (selectedEquipmentType === 'weapon') {
        allSelected = allSelected && selectedWeaponType;
    }
    document.querySelector('.refine-section').classList.toggle('active', allSelected);
    document.querySelector('.history-section').classList.toggle('active', allSelected);

    updateMaterialCostInfo();
}

function showNotification(message) {
    notificationBox.textContent = message;
    notificationBox.style.display = 'block';
    setTimeout(() => {
        notificationBox.style.display = 'none';
    }, 3000);
}

function getBlessedStoneType(level, material) {
    // Material: Oridecon, Elunium, Bradium
    if (material === 'Oridecon') {
        if (level >= 5 && level <= 8) return 'Blessed Oridecon I';
        if (level >= 9 && level <= 12) return 'Blessed Oridecon II';
        if (level >= 13 && level <= 15) return 'Blessed Oridecon III';
    } else if (material === 'Elunium') {
        if (level >= 5 && level <= 8) return 'Blessed Elunium I';
        if (level >= 9 && level <= 12) return 'Blessed Elunium II';
        if (level >= 13 && level <= 15) return 'Blessed Elunium III';
    } else if (material === 'Bradium') {
        if (level >= 5 && level <= 8) return 'Blessed Bradium I';
        if (level >= 9 && level <= 12) return 'Blessed Bradium II';
        if (level >= 13 && level <= 15) return 'Blessed Bradium III';
    }
    return null;
}

function getBlessedStonePrice(type, material) {
    if (!type) return 0;
    let id = '';
    if (type.endsWith('I')) id = '1';
    else if (type.endsWith('II')) id = '2';
    else if (type.endsWith('III')) id = '3';
    return Number(document.getElementById('price-blessed' + material.toLowerCase() + id).value) || 0;
}

function getBlessedStoneAmount() {
    // Weapon
    if (selectedEquipmentType === 'weapon') {
        let base = 0;
        if (selectedRarity === 'gold') base = 24;
        else if (selectedRarity === 'blue') base = 12;
        else if (selectedRarity === 'white') base = 8;
        // Weapon type multiplier
        if (selectedWeaponType === 'one-handed') base = Math.ceil(base * 2/3); // 16, 8, 16/3~6
        else if (selectedWeaponType === 'dagger') base = Math.ceil(base * 2/3);
        else if (selectedWeaponType === 'shield') base = Math.ceil(base * 1/3);
        return base;
    }
    // Armor
    if (selectedEquipmentType === 'armor') {
        if (selectedRarity === 'purple' || selectedRarity === 'gold') return 8;
        if (selectedRarity === 'blue') return 4;
        if (selectedRarity === 'white') return 2;
    }
    // Accessory
    if (selectedEquipmentType === 'accessory') {
        if (selectedRarity === 'gold') return 8;
        if (selectedRarity === 'blue') return 4;
        if (selectedRarity === 'white') return 2;
    }
    return 0;
}

function addBlessedStoneToSession(type, material) {
    if (!type) return;
    const qty = getBlessedStoneAmount();
    if (!sessionMaterials[type]) sessionMaterials[type] = { qty: 0, cost: 0 };
    sessionMaterials[type].qty += qty;
    sessionMaterials[type].cost += qty * getBlessedStonePrice(type, material);
    sessionTotal += qty * getBlessedStonePrice(type, material);
}

function attemptRefine() {
    // Disable button to prevent spam
    refineButton.disabled = true;
    setTimeout(() => {
        const rates = getRates();
        const rand = Math.random() * 100;
        let result = '';
        let colorClass = '';
        let nextLevel = currentRefineLevel;
        let broke = false;
        const blessedChecked = document.getElementById('blessed-stone-checkbox').checked;
        const info = getMaterialInfo();
        if (info) addToSessionMaterials(info);

        // Blessed Stone logic
        let wouldBreak = false;
        let blessedStoneUsed = false;
        let blessedStoneType = null;
        let blessedMaterial = info ? info.material : '';

        if (selectedRefineType === 'regular') {
            if (rand < rates.success) {
                result = 'Success';
                colorClass = 'success';
                nextLevel++;
            } else if (rand < rates.success + rates.fail) {
                result = 'Fail';
                colorClass = 'fail';
            } else if (rates.downgrade && rand < rates.success + rates.fail + rates.downgrade) {
                result = 'Downgrade';
                colorClass = 'downgrade';
                nextLevel = Math.max(0, currentRefineLevel - 1);
            } else if (rates.break && rand < rates.success + rates.fail + (rates.downgrade || 0) + rates.break) {
                wouldBreak = true;
                if (blessedChecked) {
                    blessedStoneType = getBlessedStoneType(currentRefineLevel, blessedMaterial);
                    if (blessedStoneType) {
                        addBlessedStoneToSession(blessedStoneType, blessedMaterial);
                        result = 'Saved by Blessed Stone';
                        colorClass = 'blessed';
                        blessedStoneUsed = true;
                    } else {
                        result = 'Break';
                        colorClass = 'break';
                        broke = true;
                    }
                } else {
                    result = 'Break';
                    colorClass = 'break';
                    broke = true;
                }
            }
        } else if (selectedRefineType === 'safe') {
            // Always add Protection Stones for safe refining if level >= 4
            const protectType = getProtectionStoneType(currentRefineLevel, blessedMaterial);
            // Calculate protection stone quantity - same as the base material amount
            let protectQty = 0;
            if (info) {
                protectQty = info.base + info.enriched + info.hd + info.uhd;
            }
            
            if (protectType && protectQty > 0) {
                if (!sessionMaterials[protectType]) sessionMaterials[protectType] = { qty: 0, cost: 0 };
                const protectPrice = getProtectionStonePrice(protectType, blessedMaterial);
                sessionMaterials[protectType].qty += protectQty;
                sessionMaterials[protectType].cost += protectQty * protectPrice;
                sessionTotal += protectQty * protectPrice;
            }
            
            // Additional Blessed Stones if checkbox is checked
            if (blessedChecked && currentRefineLevel >= 5) {
                blessedStoneType = getBlessedStoneType(currentRefineLevel, blessedMaterial);
                // Double Blessed Stones
                const blessedQty = getBlessedStoneAmount() * 2;
                if (blessedStoneType) {
                    if (!sessionMaterials[blessedStoneType]) sessionMaterials[blessedStoneType] = { qty: 0, cost: 0 };
                    const blessedPrice = getBlessedStonePrice(blessedStoneType, blessedMaterial);
                    sessionMaterials[blessedStoneType].qty += blessedQty;
                    sessionMaterials[blessedStoneType].cost += blessedQty * blessedPrice;
                    sessionTotal += blessedQty * blessedPrice;
                }
            }
            
            if (rand < rates.success) {
                result = 'Success';
                colorClass = 'success';
                nextLevel++;
            } else if (rand < rates.success + rates.fail) {
                result = 'Fail';
                colorClass = 'fail';
            } else if (rates.break && rand < rates.success + rates.fail + rates.break) {
                wouldBreak = true;
                if (blessedChecked) {
                    blessedStoneType = getSimBlessedStoneType(currentRefineLevel, blessedMaterial);
                    if (blessedStoneType) {
                        result = 'Saved by Blessed & Protection Stone';
                        colorClass = 'blessed';
                        blessedStoneUsed = true;
                    } else {
                        result = 'Break';
                        colorClass = 'break';
                        broke = true;
                    }
                } else {
                    result = 'Break';
                    colorClass = 'break';
                    broke = true;
                }
            }
        }

        // Add to history
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${colorClass}`;
        historyItem.innerHTML = `
            <span>Refine Level ${currentRefineLevel} → ${nextLevel}</span>
            <span>${result}</span>
        `;
        historyList.insertBefore(historyItem, historyList.firstChild);

        updateSessionSummaryBox();

        currentRefineLevel = nextLevel;
        setLevelDropdownToCurrent();
        currentLevelSpan.textContent = currentRefineLevel;
        updateRefineChance();

        if (broke) {
            showNotification('Your item is broken and needs to be repaired!');
        }

        // Update the weapon image and level display with downgrade flag
        updateWeaponImage();
        const isDowngrade = result === 'Downgrade';
        updateRefineLevel(isDowngrade);
        // Show animated result under the image
        showRefineResultMessage(result, colorClass);
        // Re-enable button after short delay
        setTimeout(() => {
            refineButton.disabled = false;
        }, 500);
    }, 500);
}

// Function to update the weapon image based on selection
function updateWeaponImage() {
    const weaponImageBox = document.getElementById('weapon-image-box');
    const weaponImage = document.getElementById('weapon-image');
    if (!weaponImageBox || !weaponImage) return;
    
    // Make image visible if we have appropriate selections
    if ((selectedEquipmentType === 'weapon' && selectedWeaponType && selectedRarity) ||
        (selectedEquipmentType === 'armor' && selectedRarity) ||
        (selectedEquipmentType === 'accessory' && selectedRarity)) {
        
        weaponImageBox.style.display = '';
        
        // Set image source based on equipment type, weapon type, and rarity
        if (selectedEquipmentType === 'weapon') {
            if (selectedWeaponType === 'two-handed') {
                if (selectedRarity === 'gold') {
                    weaponImage.src = 'img/2hand_gold.png';
                } else if (selectedRarity === 'blue') {
                    weaponImage.src = 'img/2hand_blue.png';
                } else {
                    weaponImage.src = 'img/2hand_white.png';
                }
            } else if (selectedWeaponType === 'one-handed') {
                if (selectedRarity === 'gold') {
                    weaponImage.src = 'img/1hand_gold.png';
                } else if (selectedRarity === 'blue') {
                    weaponImage.src = 'img/1hand_blue.png';
                } else {
                    weaponImage.src = 'img/1hand_white.png';
                }
            } else if (selectedWeaponType === 'dagger') {
                if (selectedRarity === 'gold') {
                    weaponImage.src = 'img/dagger_gold.png';
                } else if (selectedRarity === 'blue') {
                    weaponImage.src = 'img/dagger_blue.png';
                } else {
                    weaponImage.src = 'img/dagger_white.png';
                }
            } else if (selectedWeaponType === 'shield') {
                if (selectedRarity === 'gold') {
                    weaponImage.src = 'img/shield_gold.png';
                } else if (selectedRarity === 'blue') {
                    weaponImage.src = 'img/shield_blue.png';
                } else {
                    weaponImage.src = 'img/shield_white.png';
                }
            }
        } else if (selectedEquipmentType === 'armor') {
            if (selectedRarity === 'purple') {
                weaponImage.src = 'img/armor_purple.png';
            } else if (selectedRarity === 'blue') {
                weaponImage.src = 'img/armor_blue.png';
            } else {
                weaponImage.src = 'img/armor_white.png';
            }
        } else if (selectedEquipmentType === 'accessory') {
            if (selectedRarity === 'gold') {
                weaponImage.src = 'img/acce_gold.png';
            } else if (selectedRarity === 'blue') {
                weaponImage.src = 'img/acce_blue.png';
            } else {
                weaponImage.src = 'img/acce_white.png';
            }
        }
        
        // Update refine level display directly
        updateRefineLevel(false);
    } else {
        weaponImageBox.style.display = 'none';
    }
}

// Function to update refine level display inside the image (bottom right)
function updateRefineLevel(isDowngrade = false) {
    const levelDisplay = document.getElementById('current-refine-level-right');
    if (levelDisplay) {
        levelDisplay.textContent = '+' + currentRefineLevel;
        // Set color based on downgrade status
        if (isDowngrade) {
            levelDisplay.style.color = '#e74c3c'; // Red color for downgrade
            // Reset to gold after a short delay
            setTimeout(() => {
                levelDisplay.style.color = '#FFD700'; // Gold color
            }, 2000);
        } else {
            levelDisplay.style.color = '#FFD700'; // Default gold color
        }
    }
}

// Function to play sound effects
function playSound(type) {
    const soundSuccess = document.getElementById('sound-success');
    const soundFail = document.getElementById('sound-fail');
    
    // Stop any currently playing sounds
    soundSuccess.pause();
    soundSuccess.currentTime = 0;
    soundFail.pause();
    soundFail.currentTime = 0;
    
    // Play the appropriate sound
    if (type === 'success') {
        soundSuccess.play().catch(e => console.log("Error playing sound:", e));
    } else {
        soundFail.play().catch(e => console.log("Error playing sound:", e));
    }
}

// Modify the showRefineResultMessage function to play sounds
function showRefineResultMessage(result, colorClass) {
    let msg = '';
    let color = '';
    let soundType = 'fail'; // Default sound type
    
    if (result === 'Success') {
        msg = 'Success!';
        color = 'gold';
        soundType = 'success';
    } else if (result === 'Fail') {
        msg = 'Fail...';
        color = '#e74c3c';
    } else if (result === 'Break' || result === 'Break!') {
        msg = 'Break!...';
        color = '#e74c3c';
    } else if (result === 'Saved by Blessed Stone' || result === 'Saved by Blessed & Protection Stone') {
        msg = 'Saved!';
        color = '#00b894';
    } else if (result === 'Downgrade') {
        msg = 'Downgrade!...';
        color = '#e74c3c';
    }
    
    // Play the sound effect
    playSound(soundType);
    
    let msgBox = document.getElementById('refine-result-message');
    
    msgBox.textContent = msg;
    msgBox.style.color = color;
    msgBox.style.opacity = 1;
    
    // Hide after 1.5s
    setTimeout(() => {
        msgBox.style.opacity = 0;
    }, 1500);
}

function resetSimulator() {
    currentRefineLevel = 0;
    setLevelDropdownToCurrent();
    currentLevelSpan.textContent = currentRefineLevel;
    historyList.innerHTML = '';
    sessionMaterials = {};
    sessionTotal = 0;
    updateSessionSummaryBox();
    updateRefineChance();
}

function updateRarityOptions() {
    const type = equipmentTypeSelect.value;
    raritySelect.innerHTML = '<option value="">Select Rarity</option>';
    if (type === 'weapon' || type === 'accessory') {
        raritySelect.innerHTML += '<option value="gold">Gold</option>';
        raritySelect.innerHTML += '<option value="blue">Blue</option>';
        raritySelect.innerHTML += '<option value="white">White</option>';
        raritySelect.style.display = '';
    } else if (type === 'armor') {
        raritySelect.innerHTML += '<option value="purple">Purple</option>';
        raritySelect.innerHTML += '<option value="blue">Blue</option>';
        raritySelect.innerHTML += '<option value="white">White</option>';
        raritySelect.style.display = '';
    } else {
        raritySelect.style.display = 'none';
        raritySelect.value = '';
        selectedRarity = '';
    }
}

function updateDropdownStates() {
    // Weapon type
    if (equipmentTypeSelect.value === 'weapon') {
        weaponTypeSelect.style.display = '';
        weaponTypeSelect.disabled = false;
    } else {
        weaponTypeSelect.style.display = 'none';
        weaponTypeSelect.disabled = true;
        weaponTypeSelect.value = '';
        selectedWeaponType = '';
    }
    // Rarity
    let rarityEnabled = false;
    if (equipmentTypeSelect.value === 'weapon') {
        rarityEnabled = !!selectedWeaponType;
    } else if (equipmentTypeSelect.value === 'armor' || equipmentTypeSelect.value === 'accessory') {
        rarityEnabled = true;
    }
    if (equipmentTypeSelect.value && (equipmentTypeSelect.value !== 'weapon' || selectedWeaponType)) {
        raritySelect.style.display = '';
        raritySelect.disabled = !rarityEnabled;
    } else {
        raritySelect.style.display = 'none';
        raritySelect.disabled = true;
        raritySelect.value = '';
        selectedRarity = '';
    }
    // Level
    let levelEnabled = false;
    if (equipmentTypeSelect.value === 'weapon') {
        levelEnabled = !!selectedWeaponType && !!selectedRarity;
    } else if (equipmentTypeSelect.value === 'armor' || equipmentTypeSelect.value === 'accessory') {
        levelEnabled = !!selectedRarity;
    }
    equipmentLevelSelect.disabled = !levelEnabled;
    if (!levelEnabled) {
        equipmentLevelSelect.value = '';
        selectedEquipmentLevel = '';
    }

    // Range Simulator
    const rangeSimToggle = document.getElementById('range-sim-toggle');
    const rangeSimBtn = document.getElementById('range-simulate-btn');
    let rangeSimEnabled = false;
    
    if (equipmentTypeSelect.value === 'weapon') {
        rangeSimEnabled = !!selectedWeaponType && !!selectedRarity;
    } else if (equipmentTypeSelect.value === 'armor' || equipmentTypeSelect.value === 'accessory') {
        rangeSimEnabled = !!selectedRarity;
    }
    
    rangeSimToggle.disabled = !rangeSimEnabled;
    rangeSimBtn.disabled = !rangeSimEnabled;
    
    // If equipment selection is cleared, hide range simulator section
    if (!rangeSimEnabled) {
        rangeSimToggle.checked = false;
        document.getElementById('range-simulator-section').style.display = 'none';
    }

    // Show/hide weapon image
    updateWeaponImage();
}

function addToSessionMaterials(info) {
    function add(mat, qty, price) {
        if (!qty) return;
        if (!sessionMaterials[mat]) sessionMaterials[mat] = { qty: 0, cost: 0 };
        sessionMaterials[mat].qty += qty;
        sessionMaterials[mat].cost += qty * price;
    }
    if (info.base) add(info.material, info.base, Number(document.getElementById('price-' + info.material.toLowerCase()).value) || 0);
    if (info.enriched) add('Enriched ' + info.material, info.enriched, Number(document.getElementById('price-enriched-' + info.material.toLowerCase()).value) || 0);
    if (info.hd) add('HD ' + info.material, info.hd, Number(document.getElementById('price-hd-' + info.material.toLowerCase()).value) || 0);
    if (info.uhd) add('UHD ' + info.material, info.uhd, Number(document.getElementById('price-uhd-' + info.material.toLowerCase()).value) || 0);
    sessionTotal += info.total;
}

function updateSessionSummaryBox() {
    const box = document.getElementById('session-summary-box');
    let html = '<h3>Used Materials</h3>';
    const used = Object.entries(sessionMaterials).filter(([_, data]) => data.qty > 0);
    if (!sessionTotal || used.length === 0) {
        html += '<div style="color:#888;">No materials used yet.</div>';
        box.innerHTML = html;
        return;
    }
    html += '<ul>';
    for (const [mat, data] of used) {
        html += `<li><span>${mat}</span><span>${data.qty} × <span style='color:#888;'>${data.cost.toLocaleString()} Crystals</span></span></li>`;
    }
    html += '</ul>';
    html += `<div class="total-row">Total: <span>${sessionTotal.toLocaleString()} Crystals</span></div>`;
    box.innerHTML = html;
}

function setLevelDropdownToCurrent() {
    equipmentLevelSelect.value = String(currentRefineLevel);
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', toggleTheme);

// Check for saved theme preference or use system preference
function getThemePreference() {
    // Check if theme preference exists in localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        return storedTheme;
    }
    
    // Check if system prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    // Default to light mode
    return 'light';
}

// Apply theme on load
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update ad containers to match theme
    updateAdContainers(theme);
}

// Update ad containers based on current theme
function updateAdContainers(theme) {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        if (theme === 'dark') {
            container.style.background = '#2d3748';
        } else {
            container.style.background = '#f8f9fa';
        }
    });
}

// Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// Apply saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = getThemePreference();
    applyTheme(savedTheme);
});

// Attach to all relevant events
equipmentTypeSelect.addEventListener('change', updateDropdownStates);
weaponTypeSelect.addEventListener('change', updateDropdownStates);
raritySelect.addEventListener('change', updateDropdownStates);

// Call once on init to set initial image if applicable
deferInit();
function deferInit() {
    updateDropdownStates();
    updateRefineChance();
    updateSessionSummaryBox();
    updateWeaponImage();
}

// New function to get Protection Stone type based on refinement level and material
function getProtectionStoneType(level, material) {
    // Material: Oridecon (weapon), Elunium (armor), Bradium (accessory)
    if (material === 'Oridecon') {
        if (level >= 4 && level <= 7) return 'Weapon Protection Stone I';
        if (level >= 8 && level <= 11) return 'Weapon Protection Stone II';
        if (level >= 12 && level <= 15) return 'Weapon Protection Stone III';
    } else if (material === 'Elunium') {
        if (level >= 4 && level <= 7) return 'Armor Protection Stone I';
        if (level >= 8 && level <= 11) return 'Armor Protection Stone II';
        if (level >= 12 && level <= 15) return 'Armor Protection Stone III';
    } else if (material === 'Bradium') {
        if (level >= 4 && level <= 7) return 'Accessory Protection Stone I';
        if (level >= 8 && level <= 11) return 'Accessory Protection Stone II';
        if (level >= 12 && level <= 15) return 'Accessory Protection Stone III';
    }
    return null;
}

// New function to get Protection Stone price
function getProtectionStonePrice(type, material) {
    if (!type) return 0;
    let id = '';
    if (type.endsWith('I')) id = '1';
    else if (type.endsWith('II')) id = '2';
    else if (type.endsWith('III')) id = '3';
    
    let matPrefix = '';
    if (material === 'Oridecon') matPrefix = 'weapon';
    else if (material === 'Elunium') matPrefix = 'armor';
    else if (material === 'Bradium') matPrefix = 'accessory';
    
    return Number(document.getElementById('price-' + matPrefix + 'protectionstone' + id).value) || 0;
} 