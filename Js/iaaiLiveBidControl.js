"use strict";
(async () => {
    const e = async () =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "check_auth" }, (t) => e(t));
        });
    // if (!(await e())) return;
    const t = async () =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "checkControlPrebid" }, (t) => e(t));
        });
    // if (!(await t())) return;
    async function n() {
        return new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (t) => {
                e(t);
            });
        });
    }
    let s = await n();
    if (!s.auction.IAAI) return;
    const r = (e) => {
        const t = document.createElement("div");
        t.classList.add("baCover");
        e.prepend(t);
    };
    const o = async () => {
        let e = await injectNotLivePopUp();
        showPopUp(e);
    };
    function c() {
        const e = document.querySelector("body");
        let t = new MutationObserver((e) => {
            e.forEach((e) => {
                e.addedNodes.forEach(async (e) => {
                    let t = e.classList;
                    if (!t?.contains("AuctionContainer")) return;
                    if (s.live) return;
                    r(e);
                    // await o();
                });
            });
        });
        t.observe(e, { childList: true, subtree: true });
    }
    c();
})();
