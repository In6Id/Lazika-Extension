"use strict";
(async () => {
    void 0;
    const t = "switch";
    const e = "exit";
    const n = { lotInfo: "https://www.copart.com/public/data/lotdetails/solr/{{lotNumber}}" };
    let s = async () =>
        new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (e) => t(e));
        });
    s = JSON.parse(s);
    if (!s?.authStatus) return;
    void 0;
    const a = async () =>
        new Promise((t) => {
            chrome.runtime.sendMessage({ get: "checkControlPrebid" }, (e) => t(e));
        });
    // if (!(await a())) return;
    void 0;
    let i = await f();
    i = JSON.parse(i);

    void 0;
    const o = { oneBid: { attr: "ng-click", attrVal: "increaseBidForLot()", createAttr: "data-increaseBidForLot" }, minMaxBid: { attr: "ng-click", attrVal: "prelimBidForLot()", createAttr: "data-prelimBidForLot" } };
    let r = 0;
    const c = { attr: "ng-click", attrVal: "confirmBuyItNowPurchase()", createAttr: "data-confirmBuyItNowPurchase" };
    const l = { "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٬": ",", "٫": "." };
    function u(t = "") {
        const e = t?.toString() || "";
        const n = e
            .split("")
            .map((t) => {
                if (l[t]) return l[t];
                return t;
            })
            .join("");
        if (Number.isNaN(Number(n))) return n;
        return n;
    }
    function d(t) {
        let e = u(t);
        e = e.replace(/[^\d\,\.]/g, "");
        const n = [",", "."].includes(e.slice(-3, -2));
        if (n) e = e.slice(0, -3);
        return e.replace(/\D/g, "");
    }
    async function f() {
        return new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (e) => {
                t(e);
            });
        });
    }
    const m = async () =>
        new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getUserLimits" }, (e) => {
                t(e);
            });
        });
    function g() {
        const t = window.location.pathname.split("/");
        let e = null;
        const n = t.indexOf("lot");
        if (n > -1) e = t[n + 1];
        return e;
    }
    const w = () => {
        const t = { status: '[for="Bid Status"]', maxBid: '[for="your max bid"]' };
        let e = { status: [], maxBid: [] };
        for (const n in t) e[n] = $(`.panel:not(.want-it-now) ${t[n]} + .lot-details-desc`);
        if (!e.status.length && !e.maxBid.length) return false;
        const n = e.maxBid.length ? e.maxBid : e.status;
        return parseInt(d(n.text()));
    };
    const p = (t, e) => {
        let n = true;
        if (e?.pay_limit?.count_limit > 0 && e?.pay_limit?.count_pay >= e?.pay_limit?.count_limit) n = false;
        void 0;
        if (e?.bet_limit?.summ_one_bet && t > e?.bet_limit?.summ_one_bet) n = false;
        void 0;
        if (e?.bet_limit?.limit > 0 && e?.bet_limit?.count >= e?.bet_limit?.limit) n = false;
        void 0;
        return n;
    };
    const h = async (t) => {
        const e = n.lotInfo.replace("{{lotNumber}}", t);
        return fetch(e)
            .then((t) => t.json())
            .then((t) => t?.data?.lotDetails)
            .catch(() => null);
    };
    const b = (t) => t?.locState?.toUpperCase();
    const y = (t) => t?.current_account_copart_states || [];
    const _ = (t) => t?.all_copart_states || [];
    const v = async (t) =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAccId", lotState: t }, (t) => {
                e(t);
            });
        });
    const I = (t) =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAccData", accId: t }, (t) => {
                e(t);
            });
        });
    const P = (t) => {
        const { userConfig: e, lotInfo: n } = t;
        const s = b(n);
        const a = y(e);
        return a.includes(s);
    };
    const B = (t) => {
        const e = { auction: { COPART: { login: t.account, password: t.password } }, copartId: t.id };
        chrome.runtime.sendMessage({ get: "reInitAccountCopart", data: e });
    };
    const N = async (t) => {
        const e = await I(t);
        e.id = t;
        B(e);
    };
    const A = (t) => {
        t.find(".request_loader").show();
    };
    const k = (t) => {
        t.find(".request_loader").hide(500);
    };
    const x = async (n) => {
        const s = n.find(`#${t}`);
        if (s.length)
            s[0].addEventListener("click", async (t) => {
                const e = t.target.getAttribute("data-accId");
                A(n);
                await N(e);
                k(n);
            });
        const a = n.find(`#${e}`);
        if (a.length)
            a[0].addEventListener("click", (t) => {
                hidePopUp(n);
            });
    };
    const C = async () =>
        new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getStatesData" }, (e) => {
                t(e);
            });
        });
    const M = async (t) => {
        const { userConfig: e, lotInfo: n } = t;
        const s = b(n);
        const a = _(e);
        const i = await v(s);
        const o = await C();
        if (!o) return false;
        const r = o.filter((t) => t.abbrev === s.toUpperCase())?.[0]?.name;
        let c;
        if (i) c = await injectSwitchPopUp({ state: r || s, accId: i });
        else c = await injectNotAccountPopUp({ state: r || s });
        await x(c);
        showPopUp(c);
    };
    const L = async (t) => {
        const e = g();
        if (!e) return false;
        const n = await h(e);
        if (!n) return false;
        const s = P({ userConfig: t, lotInfo: n });
        if (!s) await M({ userConfig: t, lotInfo: n });
        return s;
    };
    const U = async (t, e, n = false) => {
        void 0;
        r = 0;
        let s = await m();
        void 0;
        if (!s?.success) return false;
        s = s?.data;
        if (!n) {
            if (!s?.prebid || !s?.copart || s.owner_balance <= 0) return false;
            r = w();
            void 0;
            if (!r) return false;
            if (!p(r, s)) return false;
        }
        if (!(await L(s))) return false;
        t.attr(e.attr, e.attrVal);
        t.attr("disabled", false);
    };
    const S = async (t) =>
        new Promise((e) => {
            let n = new MutationObserver((s) => {
                s.forEach((s) => {
                    s.addedNodes.forEach((s) => {
                        let a = $(s);
                        let i = null;
                        if (a.is(t)) i = a;
                        else if (a.find(t).length) i = a.find(t);
                        if (i) {
                            n.disconnect();
                            e(i);
                        }
                    });
                });
            });
            n.observe(document, { childList: true, subtree: true });
        });
    const formatDate = (date) => {
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");

        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    const O = async () => {
        if (!r) return false;
        const logData = {
            event: "Pre bid",
            timeStamp: Date.now(),
            date: formatDate(new Date()),
            userAgent: navigator?.userAgent,
            platform: navigator?.platform,
            buyerNumber: "",
            displayUserName: i?.userName || "",
            host: "COPART",
            vin: await h(t.lotNumber)?.BranchLink || "",
            lotNumber: g(),
            bid: r,
        };
        return new Promise((e) => {
            chrome.runtime.sendMessage({ get: "sendLogBid", logData: logData }, (t) => {
                e(logData);
            });
        });
    };
    const E = (t) => {
        void 0;
        t.on("click", async () => {
            const t = await S('[for="Bid Status"]');
            void 0;
            const e = t.next().text().trim().toUpperCase();
            if ("OUTBID" === e) void 0;
            else if ("WINNING" === e) await O();
        });
    };
    function V() {
        void 0;
        const t = document.querySelector("body");
        let e = new MutationObserver((t) => {
            t.forEach((t) => {
                t.addedNodes.forEach((t) => {
                    let e = $(t);
                    let n = [];
                    if (e.is("[ng-click]")) n = e;
                    else if (e.find("[ng-click]").length) n = e.find("[ng-click]");
                    if (!n.length) return true;
                    n.each((t, e) => {
                        const n = $(e);
                        for (const t in o) {
                            const e = o[t];
                            const s = n.attr(e.attr);
                            if (!s) continue;
                            // if (s !== e.attrVal) continue;
                            // n.attr(e.attr, "");
                            // n.attr("disabled", true);
                            // n.attr(e.createAttr, "true");
                            E(n);
                            // U(n, e);
                            break;
                        }
                        // const s = n.attr(c.attr);
                        // if (s && s === c.attrVal) {
                        //     n.attr(c.attr, "");
                        //     n.attr("disabled", true);
                        //     n.attr(c.createAttr, "true");
                        //     U(n, c, true);
                        // }
                    });
                });
            });
        });
        e.observe(t, { childList: true, subtree: true });
    }
    V();
})();
