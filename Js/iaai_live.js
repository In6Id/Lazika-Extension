"use strict";
(async () => {
    const e = {
        parentBlock: { selector: "#auctionEvents #Host", id: "Host" },
        auctionItem: { selector: ".AuctionContainer", class: "AuctionContainer" },
        position: { selector: "#current-vehicle__run", id: "current-vehicle__run" },
        started: { selector: "#jsEventStartedContainer", id: "jsEventStartedContainer", class: "u-hidden" },
        smallSize: { selector: ".dropdown__menu--event-size a.SizeSmall" },
    };
    const t = {};
    let n = null;
    let r = null;
    let o = null;
    const c = async ({ internalAuctionId: e, internalItemId: t }) =>
        await fetch(`https://apiportal.auctionnow.iaai.com/api/auction/AuctionItem/?internalAuctionId=${e}&internalItemId=${t}&language=&BidAPI=true`, {
            headers: {
                accept: "*/*",
                "accept-language": "ru,en;q=0.9",
                authorization: `Bearer ${o}`,
                "cache-control": "no-cache",
                "content-type": "application/json",
                pragma: "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
            },
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
        })
            .then((e) => e.json())
            .catch(() => null);
    const i = async (e) => {
        const t = $(".widgetheader-center:first").attr("title").trim();
        const n = await fetch(`https://g2auction.copart.com/g2/authenticate/api/v1/lot/getCompleteVin/${t}/${e}`, {
            headers: { accept: "application/json, text/plain, */*", "accept-language": "ru,en;q=0.9", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin" },
            referrer: "https://g2auction.copart.com/g2/",
            referrerPolicy: "no-referrer-when-downgrade",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
        })
            .then((e) => e.json())
            .then((e) => e.data)
            .catch((e) => "");
        return n;
    };
    const a = (e) => {
        const t = e ? new Date(e) : new Date();
        const n = t.getFullYear().toString();
        const r = (t.getMonth() + 1).toString();
        const o = t.getDate().toString();
        return `${n}${r[1] ? r : "0" + r[0]}${o[1] ? o : "0" + o[0]}`;
    };
    const s = () => {
        let e = null;
        try {
            e = navigator.userAgent;
        } catch (e) {}
        return e;
    };
    const l = () => {
        let e = null;
        try {
            e = navigator.platform;
        } catch (e) {}
        return e;
    };
    const u = async (e) =>
        new Promise((t) => {
            chrome.runtime.sendMessage({ get: "sendLogBid", logData: e }, (e) => {
                t(e);
            });
        });
    const d = async ({ selector: e, parent: t }) => {
        if (!t) t = document;
        return new Promise((n) => {
            const r = setInterval(() => {
                if (!t.querySelector(e)) return;
                clearInterval(r);
                n(true);
            }, 500);
        });
    };
    const m = async () => {
        const e = await fetch("/auth/token", {
            headers: { accept: "*/*", "accept-language": "ru,en;q=0.9", "cache-control": "no-cache", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            referrerPolicy: "strict-origin-when-cross-origin",
            body: "grant_type=customtoken&client_id=portal",
            method: "POST",
            mode: "cors",
            credentials: "include",
        })
            .then((e) => e.json())
            .catch(() => null);
        return e?.access_token;
    };
    const h = (e) => ({
        event: "Live sold",
        timeStamp: Date.now(),
        date: a(),
        userAgent: s(),
        platform: l(),
        buyerNumber: r.split("_")[0] || "",
        displayUserName: r || "",
        host: "IAAI",
        vin: e?.Attributes?.VIN?.Value || "",
        lotNumber: e?.Attributes?.StockNumber?.Value || "",
        bid: e.WinningBidAmount,
    });
    const f = async ({ internalAuctionId: e, internalItemId: t }) => {
        let n = null;
        let o = 0;
        while (!n) {
            o++;
            n = await c({ internalAuctionId: e, internalItemId: t });
            if (o > 2) break;
        }
        if (!n) return null;
        if (!n.WinningBidderId) return null;
        if (n.WinningBidderId !== r) return null;
        const i = h(n);
        u(i);
    };
    const p = async (n) => {
        if (!n.classList.contains(e.auctionItem.class)) return null;
        if (t[n.id]) return null;
        t[n.id] = { observer: null, lastLotId: null };
        await d({ selector: e.position.selector, parent: n });
        if (t[n.id].observer) return;
        t[n.id].observer = new MutationObserver((r) => {
            r.forEach((r) => {
                const o = r.target;
                if (o.id !== e.position.id) return;
                if (!r.oldValue) return;
                const c = o.getAttribute("data-itemId");
                t[n.id].lastLotId = c;
                if (c === r.oldValue) return;
                f({ internalAuctionId: n.id, internalItemId: r.oldValue });
            });
        });
        t[n.id].observer.observe(n, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["data-itemid"] });
    };
    const g = async (n) => {
        if (!n.classList.contains(e.auctionItem.class)) return null;
        if (!t[n.id]) return null;
        if (t[n.id].observer) t[n.id].observer.disconnect();
        delete t[n.id];
    };
    const I = async () =>
        new Promise((e) => {
            const t = setInterval(() => {
                const n = document.querySelector(".profile .dropdown__btn-label");
                const r = n?.innerText?.trim();
                if (!r) return null;
                clearInterval(t);
                e(r);
            }, 500);
        });
    const y = () => {
        const t = document.querySelectorAll(e.auctionItem.selector);
        if (!t.length) return false;
        t.forEach((e) => {
            p(e);
        });
    };
    const b = () => {
        const t = setInterval(() => {
            const t = document.querySelectorAll(e.smallSize.selector);
            if (!t.length) return false;
            t.forEach((e) => {
                const t = e.closest("li");
                if (t) t.remove();
            });
        }, 1e3);
    };
    r = await I();
    let v = 3;
    while (!o) {
        v--;
        o = await m();
        if (v) break;
    }
    if (!o) {
        document.body.addClass("hidden");
        return null;
    }
    await d({ selector: e.parentBlock.selector });
    n = new MutationObserver((e) => {
        e.forEach((e) => {
            if (e.addedNodes.length) p(e.addedNodes[0]);
            else if (e.removedNodes.length) g(e.removedNodes[0]);
        });
    });
    n.observe(document.querySelector(e.parentBlock.selector), { childList: true });
    y();
    b();
})();
