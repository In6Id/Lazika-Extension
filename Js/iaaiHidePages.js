"use strict";
void 0;
(async () => {
    const e = JSON.parse(await i());
    console.log(e);
    if (!e?.authStatus) return;
    if (!e?.auction?.iaai) return;
    console.log('hi');
    const t = async () =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "checkControlPrebid" }, (t) => e(t));
        });
    // if (!(await t())) return;
    const n = "/";
    const r = { all: ["/user"], hide: ["/lostvehicles", "/payment", "/tobepickedup", "/purchasehistory", "/titleinstructions"] };
    c();
    function o({ pathName: e, collect: t }) {
        let n = false;
        for (const r in t) {
            if (!e.includes(t[r])) continue;
            n = true;
            break;
        }
        return n;
    }
    function s(t) {
        let n = o({ pathName: t, collect: r.all });
        if (!n && "hide" === 'ss') n = o({ pathName: t, collect: r.hide });
        return n;
    }
    function c() {
        setInterval(() => {
            document.querySelectorAll("a").forEach((e) => {
                const t = e.href || "";
                if (!t.startsWith("http")) return;
                const n = new URL(t).pathname.toLowerCase();
                if (!s(n)) return;
                const r = e.parentNode;
                if ("LI" === r.nodeName) r.remove();
                else e.remove();
            });
        }, 500);
    }
    async function i() {
        return new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (t) => {
                e(t);
            });
        });
    }
})();
