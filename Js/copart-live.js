"use strict";
    (async () => {
        console.log("copart-live.js loaded");

        // Constants
        const SVG_SELECTOR = "svg.ng-star-inserted";
        const LOT_HEADER_SELECTOR = "lot-header a";
        const WIDGET_SELECTOR = "gridster-item widget>[_ngcontent-c8]";
        const IGNORED_ATTRIBUTES = ["fill"];

        // Variables
        let bidAmount = 0;
        let fillAttribute = "";
        let lotNumberText = "";
        let soldObserver = null;
        let lotNumberObserver = null;
        let buyerInfo = null;

        // Function to fetch buyer information
        const fetchBuyerInfo = async () => {
            try {
                const response = await fetch("https://g2auction.copart.com/g2/api/v1/buyerNumber/get", {
                    headers: {
                        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-language": "ru,en;q=0.9",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                    },
                    referrerPolicy: "no-referrer-when-downgrade",
                    body: null,
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                });
                const data = await response.json();
                buyerInfo = {
                    buyerNumber: data.data.buyerNumber || "",
                    displayUserName: data.data.displayUserName || ""
                };
            } catch (error) {
                buyerInfo = { buyerNumber: "", displayUserName: "" };
            }
        };

        // Initialize buyer information
        await fetchBuyerInfo();

        // Function to fetch VIN for a given lot
        const fetchVinForLot = async (lotNumber) => {
            try {
                const response = await fetch(`https://g2auction.copart.com/g2/authenticate/api/v1/lot/getCompleteVin/${lotNumberText}/${lotNumber}`, {
                    headers: { accept: "application/json, text/plain, */*", "accept-language": "ru,en;q=0.9", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin" },
                    referrer: "https://g2auction.copart.com/g2/",
                    referrerPolicy: "no-referrer-when-downgrade",
                    body: null,
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                });
                const data = await response.json();
                return data.data;
            } catch (error) {
                return "";
            }
        };

        // Function to format date
        const formatDate = (date) => {
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");

            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        // Function to get user agent
        const getUserAgent = () => {
            try {
                return navigator.userAgent;
            } catch (error) {
                return null;
            }
        };

        // Function to get platform
        const getPlatform = () => {
            try {
                return navigator.platform;
            } catch (error) {
                return null;
            }
        };

        // Function to send bid log
        const sendBidLog = async (bidData) => {
            const logData = {
                event: "Live sold",
                timeStamp: Date.now(),
                date: formatDate(new Date()),
                userAgent: getUserAgent(),
                platform: getPlatform(),
                buyerNumber: buyerInfo.buyerNumber || "",
                displayUserName: buyerInfo.displayUserName || "",
                host: "COPART",
                vin: await fetchVinForLot(bidData.lotNumber) || "",
                lotNumber: bidData.lotNumber,
                bid: bidData.bid,
            };

            return new Promise((resolve) => {
                chrome.runtime.sendMessage({ get: "sendLogBid", logData: logData }, (response) => {
                    resolve(response);
                });
            });
        };

        // Mutation observer for attribute changes
        soldObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    if (!IGNORED_ATTRIBUTES.includes(mutation.attributeName)) return;
                    if (mutation.attributeName === "fill" && mutation.target.nodeName === "circle") {
                        fillAttribute = mutation.target.getAttribute("fill");
                    }
                } else if (mutation.type === "childList") {
                    if (!mutation.addedNodes.length) return;

                    const textContent = mutation.addedNodes[0].textContent.trim();
                    if (textContent.includes("Sold")) {
                        const circleElement = document.querySelector("circle:not(.ng-star-inserted)");
                        if (circleElement) {
                            fillAttribute = circleElement.getAttribute("fill");
                        }
                        if (fillAttribute.toUpperCase() === "279E21") {
                            sendBidLog({ lotNumber: lotNumberText, bid: bidAmount });
                        }
                        return;
                    }

                    const numericValue = textContent.replace(/\D/g, "");
                    if (Number(numericValue)) {
                        bidAmount = numericValue;
                    }
                }
            });
        });

        // Mutation observer for lot number changes
        lotNumberObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                lotNumberText = mutation.target.textContent.trim();
            });
        });

        // Function to wait for an element to appear in the DOM
        const waitForElement = async (selector) =>
            new Promise((resolve) => {
                const intervalId = setInterval(() => {
                    if (!document.querySelector(selector)) return;
                    clearInterval(intervalId);
                    resolve(true);
                }, 500);
            });

        // Function to initialize observers
        const initializeObservers = async () => {
            await waitForElement(SVG_SELECTOR);
            soldObserver.observe(document.querySelector(SVG_SELECTOR), { childList: true, subtree: true, attributes: true });

            await waitForElement(LOT_HEADER_SELECTOR);
            lotNumberText = document.querySelector(LOT_HEADER_SELECTOR).innerText;
            lotNumberObserver.observe(document.querySelector(LOT_HEADER_SELECTOR), { characterData: true, childList: true, subtree: true });
        };

        // Function to disconnect observers
        const disconnectObservers = () => {
            if (soldObserver) soldObserver.disconnect();
            if (lotNumberObserver) lotNumberObserver.disconnect();
        };

        // Function to initialize and manage observers
        const initializeObserversManager = async () => {
            await initializeObservers();
            const widgetObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "childList") {
                        if (mutation.addedNodes.length) {
                            const addedNode = mutation.addedNodes[0];
                            if (addedNode.nodeType === 1) {
                                const classList = addedNode.classList;
                                if (classList.contains("widget")) {
                                    if (classList.value.includes("widget-list")) {
                                        disconnectObservers();
                                    } else {
                                        initializeObservers();
                                    }
                                }
                            }
                        }
                    }
                });
            });
            widgetObserver.observe(document.querySelector(WIDGET_SELECTOR), { childList: true });
        };

        // Wait for the main widget element to appear in the DOM and then initialize observers
        await waitForElement(WIDGET_SELECTOR);
        await initializeObserversManager();


})();