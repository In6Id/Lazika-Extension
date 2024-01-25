"use strict";
(async () => {
    const e = await a();
    console.log(e);
    // if (!e.authStatus) return;
    // if (!e.auction?.COPART?.login) return;
    // const t = async () =>
    //     new Promise((e) => {
    //         chrome.runtime.sendMessage({ get: "checkControlPrebid" }, (t) => e(t));
    //     });
    // if (!(await t())) return;
    const n = "/notfound-error";
    const o = { all: ["accountinformation", "dashboard", 'member-payments', "accountsetting", "messagesettings", "preferred-locations", "deposit", "payment-history", "funds", "lotswon", "lotslost", "mylots"], bids: ["mybids"], payments: ["member-payments"] };
    const r = ["myoffers"];
    i();
    l();
    function s({ href: e, collect: t }) {
        let n = false;
        for (const o in t) {
            if (!e.includes(t[o])) continue;
            n = true;
            break;
        }
        return n;
    }
    function c(t) {
        let n = false;
        if ("hide" === 'partly_show') n = s({ href: t, collect: o.all }) || s({ href: t, collect: o.payments });
        else if ("partly_show" === 'partly_show') n = s({ href: t, collect: o.all });
        // if (!n && "show" !== e.lots_event_setting) n = s({ href: t, collect: o.bids });
        return n;
    }
    function i() {
        setInterval(() => {
            document.querySelectorAll("a").forEach((e) => {
                const t = e.href.toLowerCase();
                if (!c(t)) return;
                if (s({ href: t, collect: r })) return;
                const n = e.parentNode;
                if ("SPAN" === n.nodeName) n.remove();
                else e.remove();
            });
        }, 500);
    }
    function l() {
        setInterval(() => {
            const e = window.location.href.toLowerCase();
            if (!c(e)) return;
            if (s({ href: e, collect: r })) return;
            window.location.href = n;
        }, 500);
    }
    async function a() {
        return new Promise((e) => {
            chrome.runtime.sendMessage({ get: "authCheck" }, (t) => {
                e(t);
            });
        });
    }
})();
