"use strict";
async function sleep(e) {
    await new Promise((t) => setTimeout(t, e));
    return true;
}
async function logInIAAI({ username: e, password: t }) {
    void 0;
    console.log(e, t);
    document.body.classList.add("hidden");
    const a = { email: "#Email", password: "#Password", submit: 'button[type="submit"]' };
    await waitElement(a.email);
    const s = document.querySelector(a.email);
    s.value = e;
    await waitElement(a.password);
    const n = document.querySelector(a.password);
    n.value = t;
    await sleep(1e3 * 2);
    await waitElement(a.submit);
    const i = document.querySelector(a.submit);
    i.click();
}
async function waitElement(e) {
    return new Promise((t) => {
        const a = setInterval(() => {
            if (!document.querySelector(e)) return;
            clearInterval(a);
            t(true);
        }, 100);
    });
}

async function promise(e) {
    return new Promise((t) => {
        chrome.runtime.sendMessage(e, (e) => {
            t(e);
        });
    });
}

(async()=> {
    if (window.location.href.includes('login') ) {
        let appInfo = await promise({get: 'getAppInfo'});
        appInfo = JSON.parse(appInfo);
        
        if(appInfo?.authStatus) {
            let getAccount = await promise({get: 'getChoosenAcc'});
            if (getAccount.auction === 'iaai') {
                let {username, password, ...rest} = getAccount
                logInIAAI({username, password});
            }
        } else {
            await promise({get: 'logout'})
        }
    }
})()


console.log('iaaiLogIn.js');