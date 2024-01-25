"use strict";
function isPageLot() {
    let e = false;
    const t = [
        "iaai.com/vehicledetail",
        "iaai.com/ru-ru/vehicledetail",
        "iaai.com/fr-ca/vehicledetail",
        "iaai.com/pl-pl/vehicledetail",
        "iaai.com/es-mx/vehicledetail",
        "iaai.com/zh-cn/vehicledetail",
        "copart.com/lot/",
        "copart.com/ru/lot/",
        "copart.com/es/lot/",
        "copart.com/ar/lot/",
        "copart.com/pl/lot/",
        "copart.com/pl/lot/",
        "copart.com/zh-hant/lot/",
        "copart.com/fr-ca/lot/",
    ];
    const a = window.location.href.toLowerCase();
    for (let n = 0; n < t.length; n++)
        if (~a.indexOf(t[n])) {
            e = true;
            break;
        }
    return e;
}
async function start() {
    if (!isPageLot()) return;
    const e = window.location.host;
    const t = c();
    const a = "https://www.copart.com/public/data/lotdetails/solr/";
    const n = "1.8L";
    const i = {};
    let r = null;
    void 0;
    await o();
    void 0;
    A();
    await S();
    async function o() {
        if ("iaai" === t) await u();
        else await _();
    }
    function c() {
        return e.indexOf("copart") > -1 ? "copart" : "iaai";
    }
    async function l(e) {
        let t = v(e);
        i.lotNumber = e.StockNo;
        i.itemNumber = e.ItemID;
        i.vehicleType = e.VehicleType;
        i.make = e.ASAPMake;
        i.model = e.ASAPModel;
        i.type = e.VehicleType.toLowerCase();
        i.car_year = parseInt(e.Year);
        i.carName = `${i.Make} ${i.Model} ${i.car_year || ""}`;
        i.reserve = e.BuyNowOfferAmount;
        i.bidders = parseInt(e.BidCountText);
        i.state = e.IaaBranchLocationForVirtualBranch || e.BranchLink;
        i.engineCapacityFull = t;
        i.engineCapacity = parseFloat(t);
        i.fuel = b(e);
        i.sale_date = h(e);
        i.estRetailValue = m(e);
        i.repairCost = y(e);
        i.sellerReserve = e.BuyNowOfferAmount;
        i.docType = e.SaleDoc;
        i.titleState = e.SaleInfo.titleState;
        i.seller = e.Seller;
        if (~i.seller.indexOf("*")) i.seller = null;
        i.vin = (await N({ lotNumber: e.StockNo, item_number: e.ItemID })) || x(e.VIN);
    }
    async function s(e) {
        let t = w(e);
        const a = p(e);
        i.lotNumber = e.auctionInformation.saleInformation.saleInfo.stockNumber || e.auctionInformation.stockNumber;
        i.itemNumber = e.auctionInformation.itemID;
        i.vehicleType = e.inventoryView.attributes.InventoryType;
        i.make = e.inventoryView.attributes.Make;
        i.model = e.inventoryView.attributes.Model;
        i.type = e.inventoryView.attributes.InventoryType.toLowerCase();
        i.car_year = parseInt(e.inventoryView.attributes.Year);
        i.carName = `${i.Make} ${i.Model} ${i.car_year || ""}`;
        i.reserve = e.auctionInformation.biddingInformation.buyNowOfferAmount;
        i.bidders = parseInt(e.auctionInformation.prebidInformation.bidCountText) || 0;
        i.state = e.auctionInformation.saleInformation.branchLink;
        i.engineCapacityFull = t;
        i.engineCapacity = parseFloat(t);
        i.fuel = e.inventoryView.attributes.FuelTypeDesc;
        i.sale_date = g(e);
        i.estRetailValue = d(e);
        i.repairCost = y(e);
        i.sellerReserve = e.auctionInformation.biddingInformation.buyNowOfferAmount;
        i.docType = a.docType;
        i.titleState = a.state;
        i.seller = f(e) || e.inventoryView.attributes.ProviderName;
        i.image = e.inventoryView?.imageDimensions?.keys?.$values?.[0]?.k || null;
        i.odometer = e.inventoryView.attributes.ODOValue || null;
        i.keys = "true" == e.inventoryView.attributes.Keys.toLowerCase() || false;
        i.bid = e.auctionInformation.prebidInformation?.decimalHighBidAmount || 0;
        i.vehicle_id = e.inventoryView.attributes.SalvageId || null;
        i.vehicle_postfix = e.inventoryView.attributes.Id.split("~")[1] || null;
        i.vin = e.inventoryView.attributes.VIN;
    }
    async function u() {
        const e = I();
        r = e;
        if (!e) return false;
        !e?.inventory ? await l(e) : s(e);
    }
    function m(e) {
        const t = e.SaleInfo.ACV ? e.SaleInfo.ACV.replace(/[$,\,]/g, "") : 0;
        return parseFloat(t);
    }
    function d(e) {
        const t = e.inventoryView.saleInformation.$values.filter((e) => "ActualCashValue" === e.key);
        const a = t.length ? t[0].value.replace(/[$,\,]/g, "") : 0;
        return parseFloat(a);
    }
    function f(e) {
        const t = e.inventoryView.saleInformation.$values.filter((e) => "Seller" === e.key);
        return t[0]?.value || null;
    }
    function p(e) {
        const t = { docType: "", state: "" };
        const a = e.inventoryView.saleInformation.$values.filter((e) => "TitleSaleDoc" === e.key);
        const n = a[0]?.value;
        if (!n) return t;
        const i = n.match(/(?<doc>.*?)\((?<state>.*?)\)/);
        t.docType = i?.groups?.doc || "";
        t.state = i?.groups?.state || "";
        return t;
    }
    function y(e) {
        let t = e?.SaleInfo?.EstimatedRepairCost || e?.inventoryView?.attributes?.EstRepairCost;
        if (t) t = t.replace(/[$,\,.]/g, "");
        return parseFloat(t);
    }
    function h(e) {
        if (parseInt(e.AuctionID)) return Date.parse(e.LiveDateinUserTimeZone) / 1e3;
        return null;
    }
    function g(e) {
        if (parseInt(e.auctionInformation.prebidInformation.auctionID)) return Date.parse(e.auctionInformation.prebidInformation.liveDateinUserTimeZone) / 1e3;
        return null;
    }
    function v(e) {
        const t = e?.VINInfo;
        const a = t.filter((e) => "Engine" === e.Name);
        if (a?.length) return a[0].DisplayValues[0].Text;
        return n;
    }
    function w(e) {
        const t = e.inventoryView.vehicleDescription.$values;
        const a = t.filter((e) => "Engine" === e.key);
        if (a?.length) return a[0].value;
        return n;
    }
    function b(e) {
        const t = e.VINInfo;
        const a = t.filter((e) => "FuelType" === e.Name);
        if (a?.length) return a[0].DisplayValues[0].Text.toLowerCase();
        return false;
    }
    function I() {
        const e = $("#ProductDetailsVM").text();
        try {
            const t = JSON.parse(e);
            return t?.VehicleDetailsViewModel || t;
        } catch (e) {
            return false;
        }
    }
    async function N(e) {
        return null;
        return await new Promise((t) => {
            chrome.runtime.sendMessage({ get: "get_iaai_full_vin", data: e }, (e) => t(e));
        });
    }
    async function _() {
        i.lotNumber = window.location.pathname.match(/\/lot\/(\d+)/)[1];
        await V(i.lotNumber);
        if (~i.vin.indexOf("*")) {
            void 0;
            const e = await k(i.lotNumber, i.make);
            i.vin = e?.[0]?.vin || i.vin;
        }
    }
    async function V(e) {
        await fetch(a + e)
            .then((e) => e.json())
            .then((e) => {
                r = e.data.lotDetails;
                i.sold = r.dynamicLotDetails.lotSold;
                i.carName = r.ld;
                i.vehicleType = r.vehTypDesc;
                i.make = r.mkn;
                i.model = r.lmg;
                i.type = r.vehTypDesc.toLowerCase();
                i.engineCapacity = parseFloat(r.egn || n);
                i.engineCapacityFull = r.egn;
                i.car_year = r.lcy;
                i.fuel = r.ft ? r.ft.toLowerCase() : false;
                i.sale_date = r.ad;
                i.seller = r.scn;
                i.estRetailValue = r.la;
                i.repairCost = r.rc;
                i.sellerReserve = null;
                i.bidders = null;
                i.state = C(r);
                i.vin = r.fv;
                i.docType = r.ts && r.td ? `${r.ts} ${r.td}` : null;
                i.titleState = r.ts || null;
                i.image = r.tims || null;
                i.odometer = r.orr || null;
                i.keys = "yes" == r.hk.toLowerCase() || false;
                i.bid = r.hb || 0;
            })
            .catch(() => {});
    }
    function C(e) {
        if (e.yn && -1 === e.yn.indexOf("*")) return e.yn;
        return e.syn;
    }
    async function k(e, t) {
        const a = D();
        return new Promise((t) => {
            chrome.runtime.sendMessage({ get: "get-lot-data-by-lot-number", data: { lots: [e], auction: "COPART" } }, (e) => {
                t(e);
            });
        });
    }
    function D() {
        const e = $("head")
            .text()
            .match(/csrfToken: "(.*)"/);
        return e ? e[1] : null;
    }
    function x(e) {
        e = e.toString();
        let t = "";
        for (let a = 0; a < e.length; ) {
            let n = "";
            n = e.charAt(a) + e.charAt(a + 1);
            t += String.fromCharCode(parseInt(n, 16));
            a += 2;
        }
        return t;
    }
    function T(e = null) {
        let t = null;
        if (!e) t = new Date();
        else t = new Date(e);
        var a = t.getFullYear().toString();
        var n = (t.getMonth() + 1).toString();
        var i = t.getDate().toString();
        return `${a}${n[1] ? n : "0" + n[0]}${i[1] ? i : "0" + i[0]}`;
    }
    async function S() {
        const e = await F();
        const a = {
            host: t.toUpperCase(),
            lot_number: i.lotNumber,
            item_number: i.itemNumber || "",
            vin: i.vin,
            make: i.make,
            model: i.model,
            year: i.car_year,
            buyer_number: e.buyerNumber || "",
            display_user_name: e.displayUserName || "",
            timeStamp: Date.now(),
            date: T(),
            userAgent: L(),
            platform: M(),
        };
        const n = await P(a);
        void 0;
    }
    function L() {
        let e = null;
        try {
            e = navigator.userAgent;
        } catch (e) {}
        return e;
    }
    function M() {
        let e = null;
        try {
            e = navigator.platform;
        } catch (e) {}
        return e;
    }
    async function P(e) {
        void 0;
        return new Promise((t) => {
            chrome.runtime.sendMessage({ get: "save_page_data", pageData: e }, (e) => t(e));
        });
    }
    async function A() {
        const e = {
            currentDate: Date.now(),
            auction: t.toLowerCase().includes("copart") ? 2 : 1,
            lot_number: i.lotNumber,
            item_number: i.itemNumber || "",
            vin: i.vin,
            make: i.make,
            model: i.model,
            year: i.car_year,
            image_link: i.image,
            odometer: i.odometer,
            est_retail_value: i.estRetailValue || 0,
            car_keys: i.keys ? "Present" : "No",
            current_bid: i.bid || 0,
            sale_date: i.sale_date,
            vehicle_id: i.vehicle_id || null,
            vehicle_postfix: i.vehicle_postfix || null,
        };
        void 0;
        return new Promise((t) => {
            chrome.runtime.sendMessage({ get: "save_car_data_for_watch", data: e }, (e) => t(e));
        });
    }
    async function q() {
        const e = { auction: "copart" };
        if ("g2auction.copart.com" === window.location.host) {
            const t = await fetch("https://g2auction.copart.com/g2/api/v1/buyerNumber/get", {
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
                .then((e) => e.json())
                .then((e) => e.data.buyerNumber)
                .catch((e) => "");
            const a = await new Promise((e) => {
                chrome.runtime.sendMessage({ get: "getUserConfig" }, (t) => e(t));
            });
            e.buyerNumber = a?.copart?.buyerNumber || t.split("-")[0] || "";
            e.displayUserName = a?.copart?.displayUserName || "";
        } else {
            const t = await fetch("https://www.copart.com/public/data/userConfig", {
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
                .then((e) => e.json())
                .then((e) => e.data.userConfig)
                .catch((e) => null);
            e.buyerNumber = t.buyerNumber || "";
            e.displayUserName = t.displayUserName || "";
            chrome.runtime.sendMessage({ get: "setUserConfig", data: e });
        }
        return e;
    }
    async function O() {
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
            .then((e) => e.json())
            .catch((e) => null);
    }
    async function U() {
        let e = "";
        let t = "";
        if (~window.location.host.indexOf("portal.auctionnow.iaai.com")) {
            t = await new Promise((e, t) => {
                let a = null;
                a = setInterval(() => {
                    const t = $(".profile .dropdown__btn-label").text().trim();
                    if (t) {
                        e(t);
                        clearInterval(a);
                    }
                }, 1e3);
            });
            e = t.split("_")[0];
        } else {
            const a = await O();
            e = a?.asapBuyerID || "";
            t = a ? `${a.firstName} ${a.lastName}` : "";
        }
        t = t.replace(/\(.*?\)/g, "").trim();
        chrome.runtime.sendMessage({ get: "setUserConfig", data: { buyerNumber: e, displayUserName: t, auction: "iaai" } });
        return { buyerNumber: e, displayUserName: t };
    }
    async function F() {
        if ("copart" === t) return await q();
        else return await U();
    }
}
chrome.runtime.onMessage.addListener((e, t, a) => {
    if ("reInitPageLog" === e) {
        void 0;
        setTimeout(() => {
            start();
        }, 2e3);
    }
});
