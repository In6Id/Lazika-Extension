"use strict";

try {
    (async () => {

        async function i(route) {
            return new Promise((e) => {
                chrome.runtime.sendMessage(route, (t) => {
                    e(t);
                });
            });
        }
    
        let copartUrl = document.getElementById('copartUrl');
        let iaaiUrl = document.getElementById('iaaiUrl');
    
        copartUrl.addEventListener('click', (e) => {
            e.preventDefault();
    
            chrome.tabs.create({
                url: 'https://www.copart.com/',
                active: true
            })
        })
    
        iaaiUrl.addEventListener('click', (e) => {
            e.preventDefault();
    
            chrome.tabs.create({
                url: 'https://www.iaai.com/',
                active: true
            })
        })
    
        let logout = document.getElementById('logoutExt');
    
        logout.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.runtime.sendMessage({get: 'logout'})
            location.href = './auth.html';
        })
    
        let reloadButton = document.getElementById('reload');

        reloadButton.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.runtime.reload();
        })
        console.log(window.localStorage.getItem('isAuth'));
    
        let appInfo = JSON.parse(await i({ get: 'getAppInfo' }))
        let userConfig = JSON.parse(await i({ get: 'getUserConfig' }))
    
        console.log(userConfig);
    
        if( userConfig && appInfo ) {

            let user = document.getElementById('user');
            let lazikaId = document.getElementById('lazikaId');
    
            user.textContent = `${userConfig.name} ${userConfig.surname}`;
            lazikaId.textContent = userConfig.passcode;

            let accountTypeSelect = document.getElementById('accountType');

            if (appInfo.auction.copart) {
                appInfo.auction.copart.forEach((type, index) => {
                    let option = document.createElement('option');
                    option.value = index;
                    option.textContent = type.name;
                    option.classList.add('copart-select-option');
                    accountTypeSelect.appendChild(option);
                    option.dataset.username = type.username;
                    option.dataset.password = type.password;
                    option.dataset.auction = 'copart';
                })
            }

            if (appInfo.auction.iaai) {
                appInfo.auction.iaai.forEach((type, index) => {
                    let option = document.createElement('option');
                    option.value = index;
                    option.textContent = type.name;
                    option.classList.add('iaai-select-option');
                    accountTypeSelect.appendChild(option);
                    option.dataset.username = type.username;
                    option.dataset.password = type.password;
                    option.dataset.auction = 'iaai';
                })
            }
            // console.log(appInfo);

            accountTypeSelect.addEventListener('change', async (e) => {
                if(e.target.value === '') return;

                let username = e.target.options[e.target.selectedIndex].dataset.username;
                let password = e.target.options[e.target.selectedIndex].dataset.password;
                let auction = e.target.options[e.target.selectedIndex].dataset.auction;

                let setChoosenAcc = await i({
                    get: 'setChoosenAcc',
                    auction: auction,
                    username: username,
                    password: password
                })

                console.log(setChoosenAcc);
                
                let res = await i({
                    get: 'loginAuction', 
                    username: username, 
                    password: password, 
                    auction: auction
                })

                console.log(res);
            })
    

        }
    
        
    
    })()
} catch (e) {
    console.log(e);
}