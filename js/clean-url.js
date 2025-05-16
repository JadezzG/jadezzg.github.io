// Clean URL script - detects and fixes recursive URLs
(function() {
    // Check if URL has multiple occurrences of the same path segment
    const currentUrl = window.location.href;
    const baseUrl = 'roxmanager.com';
    
    // Check for recursive paths
    const recursivePattern = /(\/tools\/refine-simulator\.html)\1+/;
    
    if (recursivePattern.test(currentUrl)) {
        // Fix: redirect to the clean URL
        const cleanUrl = currentUrl.replace(recursivePattern, '$1');
        window.location.replace(cleanUrl);
    }
    
    // Add URL cleaner to all links
    document.addEventListener('DOMContentLoaded', function() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (recursivePattern.test(href)) {
                    e.preventDefault();
                    window.location.href = href.replace(recursivePattern, '$1');
                }
            });
        });
    });

    // Überprüfe, ob es Redirects gibt, die noch auf /roxmanager/ verweisen
    // und ändere sie auf das Root-Verzeichnis
})(); 