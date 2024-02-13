"use strict";
(async () => {
    const e = "#bidModal";
    const t = "#btnPlaceBid";
    const n = "#btnPreBidModal";
    const r = ".bid-input-container";
    const i = ["#your-max-bid", "#max-bid", "#start-bid"];
    const o = "bidderToolsPreBidPopUp";
    await p();
    const c = m();
    const s = y();
    const u = h();
    let d = await a();
    // if (!d.auction?.IAAI) return;
    async function a() {
        return new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (t) => {
                e(t);
            });
        });
    }
    const l = async () =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "check_auth" }, (t) => e(t));
        });
    const f = async () =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "checkControlPrebid" }, (t) => e(t));
        });
    await b();
    async function b() {
        // if (!(await l())) return;
        // if (!(await f())) return;
        // if (d.prebidOn) return;
        A();
        w();
        L();
    }
    async function p() {
        return new Promise((e) => {
            let t = new MutationObserver((n) => {
                n.forEach((n) => {
                    n.addedNodes.forEach((n) => {
                        const r = m();
                        if (r) {
                            t.disconnect();
                            e(true);
                        }
                    });
                });
            });
            t.observe(document, { childList: true, subtree: true, attributes: true });
        });
    }
    function m() {
        return document.querySelector(e) || null;
    }
    function v(e) {
        return c.querySelector(e) || null;
    }
    function y() {
        if (!c) return null;
        return c.querySelector(t) || null;
    }
    function h() {
        return document.querySelector(`${n}`) || null;
    }
    function P() {
        return document.querySelector(`#${o}`) || null;
    }
    function g() {
        if (!c) return;
        c.addEventListener("submit", (e) => {
            e.preventDefault();
            E(1);
        });
    }
    function w() {
        const e = c.querySelectorAll(`${r} input`);
        e.forEach((e) => {
            e.setAttribute("disabled", true);
            e.addEventListener("click", () => {
                E(1);
            });
        });
    }
    function L() {
        if (!s) return;
        s.setAttribute("disabled", true);
        s.addEventListener("click", (e) => {
            e.preventDefault();
            E(1);
            return false;
        });
    }
    function A() {
        if (!u) return;
        u.setAttribute("disabled", true);
        u.addEventListener("click", (e) => {
            e.preventDefault();
            E(1);
            return false;
        });
    }
    function E(e) {
        if (e) q();
        else S();
    }
    function q() {
        let e = P();
        if (!e) e = M();
        e.classList.remove("hidden");
    }
    function M() {
        const e = document.querySelector("body");
        const t = `\n            <div id="${o}" class="hidden ${o}">\n                <div class="popUpBody">\n                    <div class="closePopUp">+</div>\n                    The opportunity to place a pre-bid is closed, use the online bidding.\n                </div>\n            </div>\n        `;
        e.insertAdjacentHTML("beforeend", t);
        k();
        return P();
    }
    function S() {
        let e = P();
        if (!e) return true;
        e.classList.add("hidden");
    }
    function k() {
        const e = P();
        if (!e) return true;
        e.addEventListener("click", (e) => {
            e.stopPropagation();
            const t = e.target.classList;
            if (t.contains("closePopUp") || t.contains(o)) E(0);
        });
    }
})();
