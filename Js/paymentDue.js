"use strict";
(async () => {
    const e = { clearElements: null, hideRows: null };
    const t = { classes: ["availableFunds", "sucessdiv"] };
    const s = "#paymentsDueTable";
    const n = "#paymentDueDataTable";
    const r = "#paymentHistoryDataTable_wrapper";
    const o = '[name="paymentHistoryDataTable_length"]';
    const c = { fromAttr: "[lot-id]", fromClass: ".lotNumberAnchor" };
    const a = async (e) =>
        new Promise((t) => {
            const s = setInterval(() => {
                const n = document.querySelector(e);
                if (!n) return;
                clearInterval(s);
                t(n);
            }, 500);
        });
    const i = (e) => {
        if (e) e.disconnect();
    };
    const l = (e, t) => {
        const s = e.querySelectorAll(t);
        if (!s.length) return;
        s.forEach((e) => e.remove());
    };
    const u = () => {
        for (const e in t.classes) {
            const s = t.classes[e];
            l(document, `.${s}`);
        }
    };
    const d = () => {
        i(e.clearElements);
        const s = document.body;
        e.clearElements = new MutationObserver((e) => {
            e.forEach((e) => {
                if (e.addedNodes.length) {
                    const s = e.addedNodes[0];
                    if (1 !== s.nodeType) return;
                    for (const e in t.classes) {
                        const n = t.classes[e];
                        if (s.classList.contains(n)) s.remove();
                        else l(s, `.${n}`);
                    }
                }
            });
        });
        e.clearElements.observe(s, { childList: true, subtree: true });
    };
    const f = async () =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: `checkUserPurchased` }, (t) => {
                e(t);
            });
        });
    const m = (e, t) => {
        let s = false;
        if (!t) return false;
        let n = null;
        const r = e.querySelector(c.fromClass);
        if (r) n = parseInt(r.textContent.trim());
        else {
            const t = e.querySelector(c.fromAttr);
            if (t) n = parseInt(t.getAttribute(c.fromAttr.replace(/[\[,\]]/g, "")));
        }
        if (!n) return;
        for (const e in t) {
            const r = t[e];
            if (r.lot_number === n) {
                s = true;
                break;
            }
        }
        return s;
    };
    const h = (e) => {
        const t = document.querySelector(e);
        if (!t) return;
        const s = t.querySelectorAll(`tbody tr`);
        s.forEach((e) => e.classList.add("hidden"));
        b(e);
    };
    const y = async (t) => {
        i(e.hideRows);
        let s = document.querySelector(t);
        if (!s) s = await a(t);
        e.hideRows = new MutationObserver((e) => {
            e.forEach((e) => {
                if (e.addedNodes.length) {
                    let s = false;
                    e.addedNodes.forEach((e) => {
                        if (1 !== e.nodeType || "TR" !== e.nodeName) return;
                        e.classList.add("hidden");
                        s = true;
                    });
                    if (s) b(t);
                }
            });
        });
        e.hideRows.observe(s, { childList: true, subtree: true });
    };
    const b = async (e) => {
        // const t = await f();
        if (!t) return;
        document.querySelectorAll(`${e} tbody tr`).forEach((e) => {
            if (m(e, t)) e.classList.remove("hidden");
        });
    };
    const w = async (e) => {
        const t = await a(o);
        if (!t) return;
        t.querySelectorAll("option").forEach((t) => {
            if (t.value == e) t.setAttribute("selected", true);
        });
        t.dispatchEvent(new Event("change"));
    };
    const p = async () =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (t) => {
                e(t);
            });
        });
    const g = async () => {
        // const e = await p();
        // if (!e?.authStatus) return;
        // if (!e.auction?.COPART?.login) return;
        if (~window.location.href.indexOf("/paymentsDue")) {
            h(n);
            y(s);
            u();
            d();
        } else if (~window.location.href.indexOf("/paymentHistory")) {
            w(100);
            h(r);
            y(r);
        }
    };
    g();
    chrome.runtime.onMessage.addListener((e, t, s) => {
        if ("reInitDue" === e) g();
        return true;
    });
})();
