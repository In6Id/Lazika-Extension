"use strict";
void 0;
try {
    (async () => {

        console.log("dashboard.js loaded");

        const t = { "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٬": ",", "٫": "." };
        function e(e = "") {
            const n = e?.toString() || "";
            const i = n
                .split("")
                .map((e) => {
                    if (t[e]) return t[e];
                    return e;
                })
                .join("");
            if (Number.isNaN(Number(i))) return i;
            return i;
        }
        function n(t) {
            let n = e(t);
            n = n.replace(/[^\d\,\.]/g, "");
            const i = [",", "."].includes(n.slice(-3, -2));
            if (i) n = n.slice(0, -3);
            return n.replace(/\D/g, "");
        }
        async function i() {
            return new Promise((t) => {
                chrome.runtime.sendMessage({ get: "checkControlPrebid" }, (e) => t(e));
            });
        }
        async function a() {
            return new Promise((t) => {
                chrome.runtime.sendMessage({ get: "getAppInfo" }, (e) => {
                    t(e);
                });
            });
        }
        function o() {
            return window.location.host.indexOf("copart") > -1;
        }
        const c = $("body");
        const r = await f();
        let s = "";
        c.on("click", "[ng-if=\"locale.messages['app.label.review']\"]", async function (t) {
            const e = await P("Review Offer");
            const n = $(this).attr("data-url");
            e.lotNumber = n.split("/").pop();
            await O(e);
        });
        c.on("click", async function (t) {
            const e = $(t.target);
            if ("openCounterBidCnfrmModal('acceptSellerMin')" == e.attr("ng-click")) {
                const t = v();
                const e = await P("Accept Reserve btn");
                e.lotNumber = A();
                e.bid = t;
                s = t;
                await O(e);
            } else if ("openCounterBidCnfrmModal('counterBid')" == e.attr("ng-click")) {
                const t = x();
                const e = await P("Counter Bid Now btn");
                e.lotNumber = A();
                e.bid = t;
                s = t;
                await O(e);
            } else if ("submitBid()" == e.attr("ng-click")) {
                const t = x();
                const e = await P("Submit Bid");
                e.lotNumber = A();
                e.bid = t || s;
                await O(e);
            } else if ("openIncreaseBidModal()" == e.attr("ng-click")) {
                const t = B();
                s = t;
                const n = e.text().trim() || "Bid Now btn";
                const i = await P(n);
                i.lotNumber = A();
                i.bid = t;
                await O(i);
            } else if ("dynamiclotDetails.oneMoreIncrement" == e.attr("ng-model")) {
                const t = B();
                const n = e.is(":checked") ? "Set bid one more increment" : `Unset bid one more increment`;
                const i = await P(n);
                i.lotNumber = A();
                i.bid = t || s;
                await O(i);
            } else if ("openPrelimBidModal()" == e.attr("ng-click") || "prelimBidForLot()" == e.attr("ng-click")) {
                const t = B();
                s = t;
                const n = e.text().trim() || "Bid Now btn";
                const i = await P(n);
                i.lotNumber = A();
                i.bid = t;
                await O(i);
            } else if ("increaseBidForLot()" == e.attr("ng-click")) {
                const t = B();
                const e = await P("Confirm Your Bid");
                e.lotNumber = A();
                e.bid = t || s;
                await O(e);
            } else if ("sumbitBidForMistypedBid()" == e.attr("ng-click")) {
                const t = document.querySelector('.validation-error-box [name="newMaxBid"]');
                if (t) return;
                const e = await u('[for="Bid Status"]');
                if (!e) return;
                const n = e.next().text().trim().toUpperCase();
                if ("WINNING" !== n) return;
                const i = B();
                const a = await P("Mistyped Bid");
                a.lotNumber = A();
                a.bid = i || s;
                await O(a);
            } else if ("buyItNowBtn" == e.attr("id")) {
                const t = I();
                s = t;
                const e = await P("Buy Now btn");
                e.lotNumber = A();
                e.bid = t;
                await O(e);
            } else if ("confirmBuyItNowPurchase()" == e.attr("ng-click")) {
                const t = I() || s;
                const e = await P("Confirm Purchase (Buy Now)");
                e.lotNumber = A();
                e.bid = t;
                await O(e);
            } else if (e.is('button[type="submit"]')) {
                if (e.closest("future-lot-bidding").length) {
                    const t = e.closest("future-lot-bidding");
                    const i = n(t.find('[name="bidAmount"]').val());
                    const a = await P("Max Bid Live");
                    const o = await l(t);
                    a.lotNumber = o.lotNumber;
                    a.vin = o.vin;
                    a.bid = n(i);
                    await O(a);
                } else if (e.closest("bidding-buttons").length) {
                    const t = e.closest(".widget-body");
                    const i = n(t.find('[name="bidAmount"]').val());
                    const a = e.text().trim() || "Bid Live";
                    const o = await P(a);
                    const c = await l(t);
                    o.lotNumber = c.lotNumber;
                    o.vin = c.vin;
                    o.bid = n(i);
                    await O(o);
                }
            } else if (e.is("future-lot-bidding button")) {
                const t = e.closest("future-lot-bidding");
                const i = n(t.find('[name="bidAmount"]').val());
                const a = e.attr("title") || e.attr("aria-label") || e.text();
                const o = await P(a);
                const c = await l(t);
                o.lotNumber = c.lotNumber;
                o.vin = c.vin;
                o.bid = n(i);
                await O(o);
            }
        });
        async function u(t, e) {
            const n = document.querySelector(t);
            if (n) return n;
            return new Promise((n) => {
                let i = null;
                let a = setTimeout(() => {
                    if (i) i.disconnect();
                    n(null);
                }, e || 1e3 * 10);
                i = new MutationObserver((e) => {
                    e.forEach((e) => {
                        e.addedNodes.forEach((e) => {
                            let o = $(e);
                            let c = null;
                            if (o.is(t)) c = o;
                            else if (o.find(t).length) c = o.find(t);
                            if (c) {
                                i.disconnect();
                                if (a) clearTimeout(a);
                                n(c);
                            }
                        });
                    });
                });
                i.observe(document, { childList: true, subtree: true });
            });
        }
        async function l(t) {
            let e = "";
            const n = $(".widgetheader-center:first").attr("title").trim();
            const i = m(t);
            const a = await d();
            if (a)
                e = await fetch(`https://g2auction.copart.com/g2/authenticate/api/v1/lot/getCompleteVin/${n}/${i}`, {
                    headers: { accept: "application/json, text/plain, */*", authorization: `Bearer ${a}`, "accept-language": "ru,en;q=0.9", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin" },
                    referrer: "https://g2auction.copart.com/g2/",
                    referrerPolicy: "no-referrer-when-downgrade",
                    body: null,
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                })
                    .then((t) => t.json())
                    .then((t) => t.data)
                    .catch((t) => "");
            return { lotNumber: i, vin: e };
        }
        async function d() {
            return await fetch("https://g2auction.copart.com/g2/api/v1/login", {
                headers: { accept: "application/json, text/plain, */*", "accept-language": "ru,en;q=0.9", "cache-control": "no-cache", pragma: "no-cache" },
                referrer: "https://g2auction.copart.com/g2/",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "POST",
                mode: "cors",
                credentials: "include",
            })
                .then((t) => t.json())
                .then((t) => t?.data?.["access-token"])
                .catch(() => null);
        }
        function m(t) {
            let e = $("gs-mega-future-lot-header .lotdesc");
            if (!e.length) e = t.closest("future-lot-area").find(".lot-detail");
            if (!e.length) e = t.closest(".widget-body-MICRO").find(".lotdesc");
            if (!e.length) e = t.find("lot-header");
            return e.find("a").text().trim();
        }
        async function f() {
            if ("COPART" === D()) return await V();
            else return await T();
        }
        c.on("click", ".btn--pre-bid", async function (t) {
            const e = await P("Pre-Bid btn");
            const n = w();
            e.lotNumber = n.lotNumber;
            e.itemNumber = n.itemNumber;
            e.vin = n.vin;
            await O(e);
        });
        c.on("click", "#btnPlaceBid", async function (t) {
            const e = await P("Submit Pre-Bid btn");
            const n = w();
            e.bid = p();
            s = e.bid;
            e.lotNumber = n.lotNumber;
            e.itemNumber = n.itemNumber;
            e.vin = n.vin;
            await O(e);
        });
        c.on("click", "#bottomPrebidConfirmation .btn-main", async function (t) {
            const e = await P("Confirm Pre-Bid");
            e.bid = p() || s;
            const n = w();
            e.lotNumber = n.lotNumber;
            e.itemNumber = n.itemNumber;
            e.vin = n.vin;
            await O(e);
        });
        c.on("click", ".btn--buy-now", async function (t) {
            const e = await P("Buy Now btn");
            const n = w();
            e.lotNumber = n.lotNumber;
            e.itemNumber = n.itemNumber;
            e.vin = n.vin;
            e.bid = n.bid;
            await O(e);
        });
        c.on("click", "#buynowbutton", async function (t) {
            const e = await P("Confirm Buy Now");
            const n = w();
            e.lotNumber = n.lotNumber;
            e.itemNumber = n.itemNumber;
            e.vin = n.vin;
            e.bid = n.bid;
            await O(e);
        });
        c.on("click", ".AutoBidConfirmationPlaceBid", async function (t) {
            const e = await P("Live Set Autobid");
            e.bid = b();
            const n = await h();
            await O({ ...e, ...n });
        });
        c.on("click", ".AutoBidConfirmationDeleteBid", async function (t) {
            const e = await P("Live Remove Autobid");
            e.bid = b();
            const n = await h();
            await O({ ...e, ...n });
        });
        c.on("click", ".AutoBidOptionRemove", async function (t) {
            const e = await P("Live Remove Autobid");
            e.bid = b();
            const n = await h();
            await O({ ...e, ...n });
        });
        c.on("click", ".AutoBidConfirmationModifyBid", async function (t) {
            const e = await P("Live Modify Autobid");
            e.bid = b();
            const n = await h();
            await O({ ...e, ...n });
        });
        c.on("click", ".AutoBidOptionChange", async function (t) {
            const e = await P("Live Modify Autobid");
            e.bid = b();
            const n = await h();
            await O({ ...e, ...n });
        });
        c.on("click", ".bid-area__bid", async function (t) {
            const e = await P("Live BID");
            e.bid = n($(this).text());
            const i = await N();
            await O({ ...e, ...i });
        });
        c.on("click", ".bid-area__max", async function (t) {
            const e = await P("Live AUTO");
            e.bid = 0;
            const n = await N();
            await O({ ...e, ...n });
        });
        c.on("click", ".bid-area__jump", async function (t) {
            const e = await P("Live JUMP");
            e.bid = 0;
            const n = await N();
            await O({ ...e, ...n });
        });
        function b() {
            const t = $(".js-detail-autoBid").val() || $(".autobid-amount").text() || $('[id^="js-input-autobid"]').val() || "";
            return n(t);
        }
        function p() {
            const t = $("#MaxBid").val() || "";
            return n(t);
        }
        function w() {
            const t = { itemNumber: null, lotNumber: null, vin: null, bid: null };
            const e = JSON.parse($("#ProductDetailsVM").text());
            if (e?.VehicleDetailsViewModel) {
                t.itemNumber = e.VehicleDetailsViewModel.ItemID;
                t.lotNumber = e.VehicleDetailsViewModel.SaleInfo.StockNumber;
                t.vin = _(e.VehicleDetailsViewModel.VIN);
                t.bid = n(e.VehicleDetailsViewModel.BuyNowAmount);
            } else {
                t.itemNumber = e.auctionInformation.itemID;
                t.lotNumber = e.auctionInformation.saleInformation.saleInfo.stockNumber || e.auctionInformation.stockNumber;
                t.vin = e.inventoryView.attributes.VIN;
                t.bid = n(e.auctionInformation.biddingInformation.buyNowAmount);
            }
            return t;
        }
        async function h() {
            const t = {};
            const e = $(".runlist_detail_stockNum .stock-number a");
            const n = e.attr("href") || "";
            const i = e.closest(".AuctionContainer");
            const a = i.attr("id");
            const o = i.find('.current-vehicle [data-actionname="WatchToggle"]');
            const c = o.attr("data-id");
            t.itemNumber = n.split("=").pop();
            const r = await g();
            if (r) {
                const e = await y({ auctionId: a, internalItemId: c, accessToken: r });
                if (e) {
                    t.lotNumber = e.Attributes.StockNumber.Value;
                    t.vin = e.Attributes.VIN.Value;
                } else {
                    t.lotNumber = "";
                    t.vin = "";
                }
            } else {
                t.lotNumber = e.text().trim();
                t.vin = $('.run-list-detail [data-translate="VIN"]').next().text().trim();
            }
            return t;
        }
        async function g() {
            const t = await fetch("https://portal.auctionnow.iaai.com/auth/token", {
                headers: { accept: "*/*", "accept-language": "ru,en;q=0.9", "cache-control": "no-cache", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                body: "grant_type=customtoken&client_id=portal",
                method: "POST",
                mode: "cors",
                credentials: "include",
            })
                .then((t) => t.json())
                .catch(() => null);
            if (!t) return null;
            return t.access_token || null;
        }
        async function y({ auctionId: t, internalItemId: e, accessToken: n }) {
            return await fetch(`https://apiportal.auctionnow.iaai.com/api/auction/AuctionItem/?internalAuctionId=${t}&internalItemId=${e}&language=&BidAPI=true`, {
                headers: { accept: "*/*", "accept-language": "ru,en;q=0.9", authorization: "Bearer " + n, "cache-control": "no-cache", "content-type": "application/json", pragma: "no-cache" },
                method: "GET",
                credentials: "include",
            })
                .then((t) => t.json())
                .catch(() => null);
        }
        async function N() {
            const t = {};
            const e = $(".current-vehicle__name .stock-number:first a");
            const n = e.attr("href") || "";
            const i = e.closest(".AuctionContainer");
            const a = i.attr("id");
            const o = i.find("#current-vehicle__run");
            const c = o.attr("data-itemid");
            t.itemNumber = n.split("=").pop();
            const r = await g();
            if (r) {
                const e = await y({ auctionId: a, internalItemId: c, accessToken: r });
                if (e) {
                    t.lotNumber = e.Attributes.StockNumber.Value;
                    t.vin = e.Attributes.VIN.Value;
                } else {
                    t.lotNumber = "";
                    t.vin = "";
                }
            } else {
                t.lotNumber = e.find("span:first").text().trim();
                t.vin = $('.ItemTabPosition [data-translate="VIN"]').next().text().trim();
            }
            return t;
        }
        function v() {
            let t = $(".bid-price").text();
            if (!t) t = k();
            return n(t);
        }
        function x() {
            let t = "";
            const e = $(".counter-bid-input #counterbidamount");
            if (e.length) t = e.val();
            else t = k();
            return n(t);
        }
        const B = () => {
            const t = { status: '[for="Bid Status"]', maxBid: '[for="your max bid"]' };
            let e = { status: [], maxBid: [] };
            for (const n in t) e[n] = $(`.panel:not(.want-it-now) ${t[n]} + .lot-details-desc`);
            if (!e.status.length && !e.maxBid.length) return false;
            const i = e.maxBid.length ? e.maxBid : e.status;
            return n(i.text());
        };
        function I() {
            let t = $(".buynow-popover .bid-price").text();
            if (!t) t = $(".buy-itnow .bg-auction-green").text();
            if (!t) t = $(".buyitnow-text .bid-price").text();
            if (!t) {
                const e = $("lot-details-bread-crumbs-component").attr("[lot-details]");
                try {
                    const n = JSON.parse(e);
                    t = n?.bnp;
                } catch (t) {}
            }
            return n(t);
        }
        function k() {
            let t = $(".bid-info-content .lot-details-desc:last");
            if (!t.length) t = $(".prelim-bid .lot-details-desc:last");
            let e = t.text();
            if (!e) e = $(".max-bid-price").text();
            return n(e);
        }
        function A() {
            const t = window.location.pathname.split("/");
            let e = null;
            const n = t.indexOf("lot");
            if (n > -1) e = t[n + 1];
            return e;
        }
        async function P(t) {
            return { 
                event: t, 
                timeStamp: Date.now(), 
                date: L(), 
                userAgent: C(), 
                platform: S(), 
                buyerNumber: r.buyerNumber || "", 
                displayUserName: r.displayUserName || "", 
                host: D(), 
                vin: await M() 
            };
        }
        async function M() {
            let t = "";
            if ("COPART" === D()) t = $("#vinDiv").text().trim();
            return t;
        }
        function D() {
            const t = window.location.host;
            return -1 !== t.toLowerCase().indexOf("copart") ? "COPART" : "IAAI";
        }
        function C() {
            let t = null;
            try {
                t = navigator.userAgent;
            } catch (t) {}
            return t;
        }
        function S() {
            let t = null;
            try {
                t = navigator.platform;
            } catch (t) {}
            return t;
        }
        async function V() {
            const t = { auction: "copart" };
            if ("g2auction.copart.com" === window.location.host) {
                const e = await fetch("https://g2auction.copart.com/g2/api/v1/buyerNumber/get", {
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
                })
                    .then((t) => t.json())
                    .then((t) => t.data.buyerNumber)
                    .catch((t) => "");
                const n = await new Promise((t) => {
                    chrome.runtime.sendMessage({ get: "getUserConfig" }, (e) => t(e));
                });
                t.buyerNumber = e.split("-")[0] || n?.copart?.buyerNumber || "";
                t.displayUserName = n?.copart?.displayUserName || "";
            } else {
                const e = await fetch("https://www.copart.com/public/data/userConfig", {
                    headers: {
                        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-language": "ru,en;q=0.9",
                        "cache-control": "max-age=0",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                    },
                    referrerPolicy: "no-referrer-when-downgrade",
                    body: null,
                    method: "GET",
                    credentials: "include",
                })
                    .then((t) => t.json())
                    .then((t) => t.data.userConfig)
                    .catch((t) => null);
                t.buyerNumber = e.buyerNumber || "";
                t.displayUserName = e.displayUserName || "";
                chrome.runtime.sendMessage({ get: "setUserConfig", data: t });
            }
            return t;
        }
        async function q() {
            return await fetch("https://www.iaai.com/Login/GetGBPUserLogin", {
                headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "ru,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    pragma: "no-cache",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                },
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "include",
            })
                .then((t) => t.json())
                .catch((t) => null);
        }
        async function T() {
            let t = "";
            let e = "";
            if (~window.location.host.indexOf("portal.auctionnow.iaai.com")) {
                e = await new Promise((t, e) => {
                    let n = null;
                    n = setInterval(() => {
                        const e = $(".profile .dropdown__btn-label").text().trim();
                        if (e) {
                            t(e);
                            clearInterval(n);
                        }
                    }, 1e3);
                });
                t = e.split("_")[0];
            } else {
                const n = await q();
                t = n?.asapBuyerID || "";
                e = n ? `${n.firstName} ${n.lastName}` : "";
            }
            e = e.replace(/\(.*?\)/g, "").trim();
            return { buyerNumber: t, displayUserName: e };
        }
        function L(t) {
            const e = t ? new Date(t) : new Date();
            var n = e.getFullYear().toString();
            var i = (e.getMonth() + 1).toString();
            var a = e.getDate().toString();
            return `${n}${i[1] ? i : "0" + i[0]}${a[1] ? a : "0" + a[0]}`;
        }
        async function O(t) {
            const e = await new Promise((e) => {
                chrome.runtime.sendMessage({ get: "sendLogBid", logData: t }, (t) => e(t));
            });
        }
        function _(t) {
            t = t.toString();
            let e = "";
            for (let n = 0; n < t.length; ) {
                let i = "";
                i = t.charAt(n) + t.charAt(n + 1);
                e += String.fromCharCode(parseInt(i, 16));
                n += 2;
            }
            return e;
        }
        async function j() {
            if (~window.location.href.indexOf("/paymentsDue/")) J();
            const t = window.location.pathname.toLowerCase();
            const e = ["/paymentsdue/", "/ru/paymentsdue/", "/es/paymentsdue/", "/ar/paymentsdue/", "/pl/paymentsdue/", "/pl/paymentsdue/", "/zh-hant/paymentsdue/", "/fr-ca/paymentsdue/"];
            if (~e.indexOf(t)) U();
            const n = [
                "/paymentdue/default",
                "/paymentdue/",
                "/paymentdue",
                "/ru-ru/paymentdue/default",
                "/ru-ru/paymentdue",
                "/ru-ru/paymentdue/",
                "/fr-ca/paymentdue/default",
                "/fr-ca/paymentdue",
                "/fr-ca/paymentdue/",
                "/pl-pl/paymentdue/default",
                "/pl-pl/paymentdue",
                "/pl-pl/paymentdue/",
                "/es-mx/paymentdue/default",
                "/es-mx/paymentdue",
                "/es-mx/paymentdue/",
                "/zh-cn/paymentdue/default",
                "/zh-cn/paymentdue",
                "/zh-cn/paymentdue/",
            ];
            if (-1 !== n.indexOf(t)) z();
        }
        async function U() {
            await R("#paymentDueDataTable td");
            const t = G();
            if (t.length) await E(t);
        }
        async function R(t) {
            return new Promise((e) => {
                let n = 0;
                const i = setInterval(() => {
                    const a = $(t);
                    if (a.length || n > 30) {
                        clearInterval(i);
                        setTimeout(() => {
                            e(a);
                        }, 1e3 * 2);
                    }
                    n++;
                }, 1e3);
            });
        }
        function G() {
            let t = [];
            const e = $("#paymentDueDataTable");
            const i = e.find(".dataTables_empty");
            if (!e.length || i.length) return t;
            const a = e.find("thead tr:first th").length;
            const o = 17 === a ? 1 : 2;
            t = e
                .find("tbody tr")
                .map((t, e) => {
                    const i = $(e).find("td");
                    const a = {
                        host: D(),
                        bidder: i.eq(0).find("input").attr("data-item"),
                        account: r.buyerNumber,
                        lotNumber: i.eq(0).find("input").val(),
                        vin: i
                            .eq(9 - o)
                            .text()
                            .trim(),
                        bid: n(
                            i
                                .eq(11 - o)
                                .text()
                                .trim()
                        ),
                        saleDate: i.eq(1).text().trim(),
                    };
                    a.saleDate = L(a.saleDate);
                    return a;
                })
                .get();
            return t;
        }
        async function E(t) {
            await new Promise((e) => {
                chrome.runtime.sendMessage({ get: "sendLogPaymentDue", logData: t }, (t) => e(t));
            });
        }
        async function z() {
            await R("#layoutVM");
            const t = F();
            if (t.length) await E(t);
        }
        function F() {
            let t = [];
            const e = JSON.parse($("#layoutVM").text());
            const i = e ? e.LstPaymentDues : [];
            if (!i.length) return t;
            t = i.map((t) => ({ host: D(), account: t.BuyerId, bidder: t.Bidder, lotNumber: t.StockNo, itemNumber: t.OAAuctionItemId, vin: t.VIN, bid: n(t.BidAmount.trim()), saleDate: L(t.DateWon + " 2020") }));
            return t;
        }
        function J() {
            W();
            Y();
        }
        async function W() {
            while (true) {
                const t = $(".paymentsdue .sucessdiv");
                if (!t.length) {
                    await sleep(300);
                    continue;
                }
                t.parent().detach();
                break;
            }
        }
        async function Y() {
            while (true) {
                const t = $(".payments-due-selector");
                if (!t.length) {
                    await sleep(300);
                    continue;
                }
                t.detach();
                break;
            }
        }
        c.on("click", ".lot-section", function (t) {});
        async function H() {
            return new Promise((t) => {
                chrome.runtime.sendMessage({ get: "check_auth" }, (e) => t(e));
            });
        }
        chrome.runtime.onMessage.addListener((t, e, n) => {
            if ("reInitDue" === t)
                setTimeout(() => {
                    j();
                }, 2e3);
        });
    })();
} catch (t) {
    
    console.log(t);

    const token = localStorage.getItem('token')
    const year = new Date().getFullYear()
    const month = new Date().getMonth()
    const day = new Date().getDate()
    const hours = new Date().getHours()
    const minutes = new Date().getMinutes()
    const seconds = new Date().getSeconds()
    const date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

    fetch(`https://api.lazikaautoimport.com/api/v1/dealers/copart-errors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': token
        },
        body: JSON.stringify(
            {
                error: t.message, 
                stack: t.stack || '',
                date: date,
                host: window.location.host || '',
                path: window.location.pathname || '',
                userAgent: navigator.userAgent || '',
                platform: navigator.platform || '',
                token: token || ''
            }
        )
    })
    .then((res) => res.json())
    .then((response) => {
        console.log(response)
    })
    .catch((err) => console.log(err))
}
