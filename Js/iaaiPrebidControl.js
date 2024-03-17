"use strict";
(async () => {
    const t = "switch";
    const e = "exit";
    let n = async () =>{
        return new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (e) => t(e));
        });
    }
    const a = async () =>
        new Promise((t) => {
            chrome.runtime.sendMessage({ get: "checkControlPrebid" }, (e) => t(e));
        });
    // if (!(await a())) return;
    let i = await n();
    i = JSON.parse(i);

    if (!i?.authStatus) return;
    let s = 0;
    const c = { maxBid: "#MaxBid" };
    const o = { prebid: "bidModal", buyNow: "buyModal" };
    const r = ["btnPlaceBid", "buynowbutton"];
    const u = ["anaheim consolidated", "dream rides", "online exclusive", "rec rides - online-exclusive", "virtual lane a", "virtual lane b", "virtual lane c"];
    async function l() {
        return new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (e) => {
                t(e);
            });
        });
    }
    async function d() {
        return new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getUserLimits" }, (e) => {
                t(e);
            });
        });
    }
    function f() {
        const t = w();
        if (!t) return false;
        return t.StockNumber;
    }
    const m = async (t) => {
        let e = await d();
        if (!e?.success) return false;
        e = e?.data;
        let n = true;
        if (e?.pay_limit?.count_limit > 0 && e?.pay_limit?.count_pay >= e?.pay_limit?.count_limit) n = false;
        if (e?.bet_limit?.summ_one_bet && t > e?.bet_limit?.summ_one_bet) n = false;
        if (e?.bet_limit?.limit > 0 && e?.bet_limit?.count >= e?.bet_limit?.limit) n = false;
        return n;
    };
    const w = () => {
        const t = { BranchLink: null, StockNumber: null };
        const e = $("#ProductDetailsVM").text();
        try {
            const n = JSON.parse(e);
            if (n?.VehicleDetailsViewModel) {
                t.BranchLink = n.VehicleDetailsViewModel.BranchLink;
                t.StockNumber = n.SaleInfo.StockNumber;
            } else {
                t.BranchLink = n.auctionInformation.saleInformation.branchLink;
                t.BranchState = n.inventoryView.attributes.BranchState;
                t.StockNumber = n.auctionInformation.stockNumber;
            }
        } catch (t) {
            return false;
        }
        return t;
    };
    const b = (t) => {
        if (t.BranchState) return t.BranchState.toUpperCase();
        let e = t.BranchLink;
        e = e?.replace(/(.*?\()|(\).*?)/g, "");
        return e?.toUpperCase();
    };
    const h = (t) => t?.current_account_iaai_states || [];
    const g = (t) => t?.all_iaai_states || [];
    const y = async (t) =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAccId", lotState: t, auction: "iaai" }, (t) => {
                e(t);
            });
        });
    const p = (t) =>
        new Promise((e) => {
            chrome.runtime.sendMessage({ get: "getAccData", accId: t, auction: "iaai" }, (t) => {
                e(t);
            });
        });
    const I = (t) => {
        const { userConfig: e, lotInfo: n } = t;
        if (u.includes(n.BranchLink.toLowerCase())) return true;
        const a = b(n);
        const i = h(e);
        return i.includes(a);
    };
    const _ = (t) => {
        const e = { auction: { IAAI: { login: t.account, password: t.password } }, iaaiId: t.id };
        chrome.runtime.sendMessage({ get: "reInitAccountIAAI", data: e, url: window.location.href });
    };
    const k = async (t) => {
        void 0;
        const e = await p(t);
        e.id = Number(t);
        void 0;
        _(e);
    };
    const B = (t) => {
        t.find(".request_loader").show();
    };
    const v = (t) => {
        t.find(".request_loader").hide(500);
    };
    const P = async (n) => {
        const a = n.find(`#${t}`);
        if (a.length)
            a[0].addEventListener("click", async (t) => {
                const e = t.target.getAttribute("data-accId");
                B(n);
                await k(e);
                window.location.reload();
            });
        const i = n.find(`#${e}`);
        if (i.length)
            i[0].addEventListener("click", (t) => {
                hidePopUp(n);
            });
    };
    const S = async () =>
        new Promise((t) => {
            chrome.runtime.sendMessage({ get: "getStatesData" }, (e) => {
                t(e);
            });
        });
    const A = async (t) => {
        const { userConfig: e, lotInfo: n } = t;
        const a = b(n);
        const i = g(e);
        const s = await y(a);
        const c = await S();
        if (!c) return false;
        const o = c.filter((t) => t.abbrev === a.toUpperCase())?.[0]?.name;
        let r;
        if (s) r = await injectSwitchPopUp({ state: o || a, accId: s });
        else r = await injectNotAccountPopUp({ state: o || a });
        await P(r);
        showPopUp(r);
    };
    const M = async (t) => {
        const e = w();
        if (!e) return false;
        const n = e.StockNumber;
        if (!n) return false;
        const a = I({ userConfig: t, lotInfo: e });
        if (!a) await A({ userConfig: t, lotInfo: e });
        return a;
    };
    const N = async (t) => {
        let e = await d();
        if (!e?.success) return false;
        e = e?.data;
        if (!t.is(`#${o.buyNow}`)) if (!e?.prebid || !e?.iaai) return false;
        if (!(await M(e))) return false;
        return true;
    };
    const L = async (t) =>
        new Promise((e) => {
            const n = setInterval(() => {
                if (!document.querySelectorAll(t).length) return;
                clearInterval(n);
                e(true);
            }, 1e3);
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
    const x = async () => {
        if (!s) return false;
        const logData = {
            event: "Pre bid",
            timeStamp: Date.now(),
            date: formatDate(new Date()),
            userAgent: navigator?.userAgent,
            platform: navigator?.platform,
            buyerNumber: "",
            displayUserName: i?.userName || "",
            host: "IAAI",
            vin: await w()?.BranchLink || "",
            lotNumber: f(),
            bid: s,
            url: window.location.href,
        };
        return new Promise((e) => {
            chrome.runtime.sendMessage({ get: "sendLogBid", logData: logData }, (t) => {
                e(logData);
            });
        });
    };
    function C() {}
    const U = (t) => {
        const e = r.map((t) => `#${t}`);
        t.on("click", `${e.join(",")}`, async (t) => {
            if ("btnPlaceBid" === t.target.id) await x();
            else await C();
        });
    };
    function j() {
        $(r.map((t) => `#${t}`).join(",")).attr("disabled", true);
    }
    function V() {
        $(r.map((t) => `#${t}`).join(",")).attr("disabled", false);
    }
    function D() {
        $(c.maxBid).attr("disabled", true);
    }
    function q() {
        $(c.maxBid).attr("disabled", false);
    }
    async function E() {
        for (const t in o) {
            const e = o[t];
            if (!e) continue;
            await L(`#${e}`);
        }
        const t = Object.values(o);
        const e = $(t.map((t) => `#${t}`).join(","));
        e.each(async (t, e) => {
            const n = $(e);
            // j();
            // D();
            U(n);
            // const a = await N(n);
            // if (!a) return false;
            // V();
            // q();
        });
    }
    async function O(t) {
        // const e = await m(t);
        // if (e) V();
        // else j();
    }
    async function J() {
        await L(c.maxBid);
        const t = document.querySelector(c.maxBid);
        t.addEventListener("input", (t) => {
            s = t.target.value;
            O(s);
        });
    }
    E();
    J();
})();
