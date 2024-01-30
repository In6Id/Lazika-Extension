"use strict";

(async () => {
    // Authenticate and get result
    const isAuthenticated = await checkAuthentication();
    
    // Define constants
    const notFoundErrorPage = "/notfound-error";
    const pageCollections = {
        all: ['member-payments', "accountsetting", "messagesettings", "preferred-locations", "deposit", "payment-history", "funds", "lotswon", "lotslost", "mylots"],
        bids: ["mybids"],
        payments: ["member-payments"]
    };
    const excludePages = ["myoffers"];

    // Set up intervals for checking and handling elements
    checkAndRemoveElements();
    redirectIfUnauthorized();

    // Helper function to check if a page should be collected
    function shouldCollect({ href, collect }) {
        let shouldCollect = false;
        for (const key in collect) {
            if (href.includes(collect[key])) {
                shouldCollect = true;
                break;
            }
        }
        return shouldCollect;
    }

    // Helper function to check if an element should be excluded
    function shouldExclude(href) {
        let shouldExclude = false;
        if ("hide" === 'partly_show') {
            shouldExclude = shouldCollect({ href, collect: pageCollections.all }) || shouldCollect({ href, collect: pageCollections.payments });
        } else if ("partly_show" === 'partly_show') {
            shouldExclude = shouldCollect({ href, collect: pageCollections.all });
        }
        // Uncomment the following block if needed
        // if (!shouldExclude && "show" !== 'asd') {
        //     shouldExclude = shouldCollect({ href, collect: pageCollections.bids });
        // }
        return shouldExclude;
    }

    // Function to periodically check and remove elements
    function checkAndRemoveElements() {
        setInterval(() => {
            document.querySelectorAll("a").forEach((element) => {
                const href = element.href.toLowerCase();
                if(element.getAttribute("data-uname") === "homePageDashboardTab") element.remove();
                
                if (!shouldExclude(href)) return;
                if (shouldCollect({ href, collect: excludePages })) return;
                const parent = element.parentNode;
                if ("SPAN" === parent.nodeName) parent.remove();
                else element.remove();
            });
        }, 500);
    }

    // Function to periodically check and redirect if unauthorized
    function redirectIfUnauthorized() {
        setInterval(() => {
            const currentHref = window.location.href.toLowerCase();
            if(currentHref.includes('dashboard') && !currentHref.includes('auction')) window.location.href = notFoundErrorPage;
            if (!shouldExclude(currentHref)) return;
            if (shouldCollect({ href: currentHref, collect: excludePages })) return;
            window.location.href = notFoundErrorPage;
        }, 500);
    }

    // Async function to check authentication using a Promise
    async function checkAuthentication() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ get: "authCheck" }, (result) => {
                resolve(result);
            });
        });
    }
})();