/**
 * Safe Refine Button Fix - Additional layer of protection
 * This ensures the Safe Refine option is always available regardless of refinement level
 */
(function() {
    // Ensure this script runs after DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSafeButtonFix);
    } else {
        initSafeButtonFix();
    }
    
    function initSafeButtonFix() {
        // Get references to the elements
        const safeRefineRadio = document.getElementById('safe-refine-radio');
        
        if (!safeRefineRadio) {
            console.error('Safe Refine radio button not found');
            return;
        }
        
        // Primary fix: Override the element's properties
        Object.defineProperty(safeRefineRadio, 'disabled', {
            configurable: true,
            get: function() { return false; },
            set: function() { /* Silently ignore attempts to disable */ }
        });
        
        // Secondary fix: Force-enable at regular intervals
        function forceSafeRefineEnabled() {
            // Enable the radio button
            safeRefineRadio.removeAttribute('disabled');
            
            // Apply inline styles
            safeRefineRadio.style.pointerEvents = 'auto';
            safeRefineRadio.style.opacity = '1';
            safeRefineRadio.style.cursor = 'pointer';
            
            // Also fix the parent label
            const label = safeRefineRadio.closest('label');
            if (label) {
                label.style.pointerEvents = 'auto';
                label.style.opacity = '1';
                label.style.cursor = 'pointer';
                label.classList.remove('disabled');
            }
        }
        
        // Run the fix at different intervals to catch various scenarios
        forceSafeRefineEnabled();
        setTimeout(forceSafeRefineEnabled, 50);
        setInterval(forceSafeRefineEnabled, 500);
        
        // Tertiary fix: Add click interceptor to ensure clicks are registered
        document.addEventListener('click', function(e) {
            if (e.target === safeRefineRadio || e.target.closest('label') === safeRefineRadio.closest('label')) {
                if (!safeRefineRadio.checked) {
                    safeRefineRadio.checked = true;
                    // Dispatch change event
                    safeRefineRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }, true);
    }
})(); 