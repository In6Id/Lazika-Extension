(async () => {
    let username = "";
    let initials = "";

    initialize();

    let appInfo = await getAppInfo();
    appInfo = JSON.parse(appInfo);

    if (!appInfo?.authStatus) {
        hideUserInfo();
        return;
    }

    let loggedInUserName = await getUserName();
    const site = determineSite();

    cleanUp();

    async function getAppInfo() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ get: "getAppInfo" }, (info) => {
                resolve(info);
            });
        });
    }

    async function getUserName() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ get: "getUserConfig" }, (name) => {
                if (name) {
                    name = JSON.parse(name);
                    resolve(`${name.name} ${name.surname}`);
                }
            });
        });
    }

    async function checkAuth() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ get: "check_auth" }, (authenticated) => resolve(authenticated));
        });
    }

    async function getPermissionAuctionLogin() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ get: "getPermissionAuctionLogin" }, (permission) => resolve(permission));
        });
    }

    function determineSite() {
        const url = new URL(window.location.href);
        const host = url.host.toLowerCase();
        if (host.includes("copart.com")) return "copart";
        if (host.includes("iaai.com")) return "iaai";
        return;
    }

    async function delay(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }

    function cleanUp() {
        if (site === "copart") {
            updateCopartUserInfo();
        } else if (site === "iaai") {
            updateIaaiUserInfo();
        }
    }

    async function updateCopartUserInfo() {
        return new Promise(async () => {
            while (true) {
                if (!loggedInUserName) loggedInUserName = await getUserName();
                if (loggedInUserName) {
                    const elements = document.querySelectorAll(".loggedInUserIcon");
                    elements.forEach((element) => {
                        element.innerText = loggedInUserName;
                        element.classList.add("show");
                    });
                }
                await delay(200);
            }
        });
    }

    function updateIaaiUserInfo() {
        return new Promise(async () => {
            while (true) {
                if (!loggedInUserName) loggedInUserName = await getUserName();
                if (loggedInUserName) {
                    const nameElements = document.querySelectorAll(".header__avatar-name");
                    nameElements.forEach((element) => {
                        element.innerText = loggedInUserName;
                        element.classList.add("show");
                    });
                    const initialsElements = document.querySelectorAll(".header__user .dropdown-initials");
                    initialsElements.forEach((element) => {
                        element.innerText = "";
                        element.classList.add("show");
                    });
                    const welcomeElements = document.querySelectorAll(".user-name__welcome");
                    welcomeElements.forEach((element) => {
                        element.innerText = loggedInUserName;
                    });
                }
                await delay(200);
            }
        });
    }

    function initialize() {
        clearUserInfo();
        clearHeaderUserInfo();
    }

    function clearUserInfo() {
        const elements = document.querySelectorAll(".loggedInUserIcon");
        elements.forEach((element) => {
            if (!username) username = element.innerText.trim();
            element.innerText = "";
        });
    }

    function clearHeaderUserInfo() {
        const nameElements = document.querySelectorAll(".header__avatar-name");
        nameElements.forEach((element) => {
            if (!username) username = element.innerText.trim();
            element.innerText = "";
        });
        const initialsElements = document.querySelectorAll(".header__user .dropdown-initials");
        initialsElements.forEach((element) => {
            if (!initials) initials = element.innerText.trim();
            element.innerText = "";
        });
    }

    function hideUserInfo() {
        showInitialUserInfo();
        restoreHeaderUserInfo();
    }

    function showInitialUserInfo() {
        const elements = document.querySelectorAll(".loggedInUserIcon");
        elements.forEach((element) => {
            element.classList.add("show");
            if (username) element.innerText = username;
        });
    }

    function restoreHeaderUserInfo() {
        const nameElements = document.querySelectorAll(".header__avatar-name");
        nameElements.forEach((element) => {
            element.innerText = username;
            element.classList.add("show");
        });
        const initialsElements = document.querySelectorAll(".header__user .dropdown-initials");
        initialsElements.forEach((element) => {
            element.innerText = initials;
            element.classList.add("show");
        });
        const welcomeElements = document.querySelectorAll(".user-name__welcome");
        welcomeElements.forEach((element) => {
            element.innerText = username;
            element.classList.add("show");
        });
    }
})();
