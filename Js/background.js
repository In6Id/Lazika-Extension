"use strict";

try {
  // (async () => {

      console.log("background.js loaded")

      const setLocalstorage = async (e) =>
          new Promise((t) => {
            chrome.storage.local.set(e, (e) => {
                t(true);
            });
          });

      const getLocalstorage = async (e) =>
          new Promise((t) => {
              chrome.storage.local.get([e], (a) => {
                  t(a[e]);
              });
          });

      setPopUpPage()

      // chrome.webRequest.onBeforeRequest.addListener(
      //     (e) => {
      //         const t = new URL(e.url);
      //         if (t.host.toLowerCase().includes("copart")) console.log({ details: e });
      //         else if (t.host.toLowerCase().includes("iaai")) console.log({ details: e });
      //     },
      //     { urls: ["<all_urls>"] },
      //     ["requestBody"]
      // );

      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

            chrome.runtime.setUninstallURL('https://www.copart.com/doLogout.html');
        

            if (message.isAuth) {
              console.log('logged in')
              authorization();
            }

            if (message.htmlContent) {
              message.htmlContent = false;
              console.log("Received HTML content:", message.htmlContent);
            } 

            if(message.get === 'logout') {
              console.log('logout');
              logout()
            }

            if(message.checkAuth) {
              message.checkAuth = false;
              setPopUpPage()
            }

            if(message.logoutFromCopart) {
              message.logoutFromCopart = false;
              console.log('logout from copart')
              logoutFromCopart()
            }

            if(message.token) {
              chrome.storage.local.set({token: message.token})
            }

            if(message.credentialsData) {
              chrome.storage.local.set({credentialsData: message.credentialsData})
            }

            if (message.fetchVehicles) {
              // Handle the logic to fetch vehicles and manipulate the DOM
              chrome.storage.local.get('vehicles', (result) => {
                if(!result.vehicles){
                  getVehicles()
                }
              });
            }

            if(message.get === 'sendLogBid') {
              sendBidLog(message.logData);
            }

            if(message.get === 'checkControlPrebid') {}
            if(message.get === 'getAppInfo') {
              infoApp().then((appInfo) => {
                sendResponse(appInfo)
              })
            }
            if(message.get === 'getUserConfig') {
              getUserConfig().then((userConfig) => {
                sendResponse(userConfig)
              })
            }
            if(message.get === 'setUserConfig') {}
            if(message.get === 'sendLogPaymentDue') {}
            if(message.get === 'check_auth') {}
            if(message.get === 'reInitPageLog') {}
            if(message.get === 'reInitDue') {}
            if(message.get === 'getChoosenAcc') {
              getChoosenAcc().then((choosenAcc) => {
                console.log(JSON.parse(choosenAcc));
                if(!choosenAcc) return sendResponse(false)
                sendResponse(JSON.parse(choosenAcc))
              })
            }
            if(message.get === 'setChoosenAcc') {
              setChoosenAcc(message).then(() => {
                sendResponse(true)
              })
            }
            if(message.get === 'authCheck') {
              // sendResponse(await getLocalstorage("is_auth"))
            }
            if(message.get === 'login') {
              login({ token: message.token, credentials: JSON.parse(message.credentials)}).then((response) => {
                sendResponse(response)
              })
            }
            if(message.get === 'getUserInfo') {
              getUserInfo().then((userInfo) => {
                sendResponse(userInfo)
              })
            }

            if(message.get === 'loginAuction') {
              if(message.auction === 'copart') {
                loginCopart()
                sendResponse(true)
              }
              if(message.auction === 'iaai') {
                loginIaai()
                sendResponse(true)
              }
            }

            return true;
      })

      async function getChoosenAcc() {
        return new Promise((resolve) => {
          chrome.storage.local.get('choosenAcc', (result) => {
            resolve(result.choosenAcc)
          })
        })
      }

      async function setChoosenAcc(choosenAccount) {
        await setLocalstorage({ choosenAcc: JSON.stringify(choosenAccount) })
      }

      async function infoApp() {
        const appInfo = await getAppInfo()
        return appInfo
      }

      async function getUserAccounts(credentials) {

        const userAccounts = await fetch(`https://api.lazikaautoimport.com/api/v1/accounts/dealerAccounts?user_id=${Number(credentials.id)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
        })
        .then(response => response.json())
        .then(data => {
            return data
        })
        .catch(error => {
            console.error('Error fetching data from the API:', error);
        });
        return userAccounts
        
      }

      async function login({ token, credentials }) {
          return new Promise(async (resolve) => {
            credentials.token = token
            await resetUserConfig()
            await setUserConfig(credentials)
            const userAccounts = await getUserAccounts(credentials)
            console.log(userAccounts);
            await setAppInfo(userAccounts, credentials, true)
            await setLocalstorage({ is_auth: 'true' })
            
            // const userConfig = await getUserConfig()
            // const appInfo = await getAppInfo()

            // if (appInfo.authStatus) {
            //     if (userConfig.copart.login && userConfig.copart.password) {
            //         await loginCopart(userConfig.copart.login, userConfig.copart.password)
            //     }
            //     if (userConfig.iaai.login && userConfig.iaai.password) {
            //         await loginIaai(userConfig.iaai.login, userConfig.iaai.password)
            //     }
            // }
            resolve(true)
          })
      }

      async function loginCopart() {
        return new Promise((resolve) => {

          chrome.tabs.onCreated.addListener((tab) => {

            if ( tab.pendingUrl.toLowerCase().includes("copart") ) {

                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  function: async () => {

                      let credentials = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({get: 'getChoosenAcc'}, (response) => {
                          resolve(response)
                        })
                      })
              
                      let { username, password } = credentials
              
                      fetch('https://www.copart.com/doLogout.html')
                      .then((res) => {
                          fetch('https://www.copart.com/processLogin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            body: JSON.stringify({
                                username: username,
                                password: password,
                                accountType: "0",
                                accountTypeValue: "0",
                            })
                          })
                          .then((res) => res.json())
                          .then((response) => {
                              window.location.reload()
                          })
                      })

                  },
                });     

            } else if ( tab.pendingUrl.toLowerCase().includes("iaai") ) {

                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  function: async () => {

                        async function sendMessagea(e, t) {
                          return new Promise((a) => {
                              chrome.tabs.sendMessage(e, t, () => {
                                  a(true);
                              });
                          });
                        }
                      
                        let t = await new Promise((e, t) => {
                          chrome.tabs.create({ url: 'https://www.iaai.com/Dashboard/Default', active: false, pinned: true }, function (t) {
                              e(t.id);
                          });
                        });

                        let credentials = await new Promise((resolve) => {
                          chrome.runtime.sendMessage({get: 'getChoosenAcc'}, (response) => {
                            resolve(response)
                          })
                        })
                
                        let { username, password } = credentials

                        sendMessagea(t, { get: "logInIAAI", data: credentials });

                  },
                });

            }

          })

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            const tabUrl = tabs[0]?.url;
            console.log(tabs);
            if (tabId !== undefined) {
              if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://') ) {
                chrome.tabs.create({ url: 'https://www.copart.com/', active: true });
              }else {
                chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  function: async () => {

                      let credentials = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({get: 'getChoosenAcc'}, (response) => {
                          resolve(response)
                        })
                      })
              
                      let { username, password } = credentials
              
                      fetch('https://www.copart.com/doLogout.html')
                      .then((res) => {
                          fetch('https://www.copart.com/processLogin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            body: JSON.stringify({
                                username: username,
                                password: password,
                                accountType: "0",
                                accountTypeValue: "0",
                            })
                          })
                          .then((res) => res.json())
                          .then((response) => {
                              window.location.reload()
                          })
                      })

                  },
                });
              }
            } else {
              chrome.tabs.create({ url: 'https://www.copart.com/', active: true });

              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tabId = tabs[0]?.id;
                chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  function: async () => {
                    
                      let credentials = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({get: 'getChoosenAcc'}, (response) => {
                          resolve(response)
                        })
                      })
              
                      let { username, password } = credentials
              
                      fetch('https://www.copart.com/doLogout.html')
                      .then((res) => {
                          fetch('https://www.copart.com/processLogin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            body: JSON.stringify({
                                username: username,
                                password: password,
                                accountType: "0",
                                accountTypeValue: "0",
                            })
                          })
                          .then((res) => res.json())
                          .then((response) => {
                              window.location.reload()
                          })
                      })
                      
                  },
                });
              });
            }
          });
        })
      }

      // Function to handle tab creation event
      async function onTabCreated(tab) {
        console.log(tab);

        if (tab.pendingUrl.toLowerCase().includes("copart")) {
            await executeCopartScript(tab.id);
        } else if (tab.pendingUrl.toLowerCase().includes("iaai")) {
            await loginIaai(tab.id);
        }
      }

      // Function to execute Copart script
      async function executeCopartScript(tabId) {
        try {
          let credentials = await new Promise((resolve) => {
            chrome.runtime.sendMessage({get: 'getChoosenAcc'}, (response) => {
              resolve(response)
            })
          })
  
          let { username, password } = credentials
  
          fetch('https://www.copart.com/doLogout.html')
          .then((res) => {
              fetch('https://www.copart.com/processLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    accountType: "0",
                    accountTypeValue: "0",
                })
              })
              .then((res) => res.json())
              .then((response) => {
                chrome.tabs.reload(tabId);
              })
          })

            // Reload the tab after login
        } catch (error) {
            console.error("Error executing Copart script:", error);
        }
      }

        // Function to login to Iaai
        async function loginIaai(tabId) {
            try {
                let iaaiTabId = tabId
                if (iaaiTabId) {
                    console.log("Iaai tab found:", iaaiTabId);
                    let credentials = await getCredentials();
                    // Check if the tab is still open before sending the message
                    if (iaaiTabId) {
                      console.log(iaaiTabId);
                      chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                        let activeTab = tabs[0];
                        if (activeTab.id === iaaiTabId) {
                            await sendMessageToTab(iaaiTabId, { get: "logInIAAI", data: credentials });
                        }
                      })
                    } else {
                        console.error("Iaai tab is closed or unavailable.");
                    }
                } else {
                    console.log("Creating new Iaai tab...");
                    // Create a new tab with the Iaai URL
                    chrome.tabs.create({ url: 'https://login.iaai.com/', active: true }, async function (newTab) {
                        console.log("New Iaai tab created:", newTab);
                        let credentials = await getCredentials();
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            let activeTab = tabs[0];
                            if (activeTab.id === newTab.id) {
                                sendMessageToTab(newTab.id, { get: "logInIAAI", data: credentials });
                            }
                        });
                    });
                }
            } catch (error) {
                console.error("Error logging in Iaai:", error);
            }
        }
      

        // Function to find an existing Iaai tab
        async function findIaaiTab() {
          return new Promise((resolve) => {
              chrome.tabs.query({ url: "*://*.iaai.com/*" }, (tabs) => {
                  resolve(tabs.length > 0 ? tabs[0] : null);
              });
          });
        }

      // Function to get credentials from background script
      async function getCredentials() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ get: 'getChoosenAcc' }, (response) => {
                resolve(response);
            });
        });
      }

      // Function to send message to a tab
      async function sendMessageToTab(tabId, message) {
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, message, () => {
                resolve(true);
            });
        });
      }

      // Function to get the current tab
      async function getCurrentTab() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0]);
            });
        });
      }

      // Add listener for tab creation events
      chrome.tabs.onCreated.addListener(onTabCreated);

      async function resetUserConfig() {
          await setLocalstorage({ userConfig: JSON.stringify(defaultUserConfig()) })
      }

      const defaultUserConfig = () => { 
        return {
            authStatus: false,
            userId: 0,
            userName: "",
            token: ""
        } 
      }

      async function setUserConfig(credentials) {

          await setLocalstorage({ userConfig: JSON.stringify(credentials)})

      }

      async function getAppInfo() {
          return new Promise((resolve) => {
            chrome.storage.local.get('appInfo', (result) => {
              resolve(result.appInfo)
            })
          })
      }

      async function setAppInfo(appInfoData = {}, credentials = {}, login = false) {
        
        console.log(appInfoData);

        if ( login ) {
            await setLocalstorage({ appInfo: JSON.stringify({
                userId: appInfoData.data.user_id,
                userName: credentials.username,
                token: credentials.token,
                authStatus: true,
                auction: {
                  ...appInfoData.data.accounts
                }
              })
            }) 

            return 
        }

        await setLocalstorage({ appInfo: null })

        await setLocalstorage({ userConfig: null })

        await setLocalstorage({ vehicles: null })

        await setLocalstorage({ token: null })

        await setLocalstorage({ credentialsData: null })

        await setLocalstorage({ choosenAcc: null })

        await setLocalstorage({ is_auth: 'false' })

      }


      // async function setUserConfig(e = null) {
      //     return new Promise((t) => {
      //         chrome.storage.local.set(e, (e) => {
      //             t(true);
      //         });
      //     });
      // }

      async function getUserConfig() {
          return await getLocalstorage("userConfig")
      }

      async function setPopUpPermissions(tab) {
        if (tab?.discarded) return;
        if (tab?.url && (tab?.url.includes("copart.com"))) chrome.action.enable(tab?.id);
        else chrome.action.disable(tab?.id);
      }

      async function authorization() {

          let userInfo = await getUserInfo()

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

              // setPopUpPermissions(tabs[0]);

              chrome.storage.local.set({is_auth: 'true'}, () => {

                  chrome.tabs.reload(tabs[0]?.id);
                  parseAndLogHTML()
                  setPopUpPage()

              });
          });

      }

      async function getUserInfo() {
          return new Promise((resolve) => {
            fetch(`https://api.lazikaautoimport.com/api/v1/auth/copart-login?username=${login.value}&password=${password.value}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            })
            .then((res) => res.json())
            .then((response) => {

                console.log(response)

                if(response.status == true) {
                    resolve(response.data)
                }

            })
            .catch((err) => console.log(err))
          })
      }

      async function sendBidLog(logData) {

        const ipInfo = await getIPInfo()
        let token = await getAppInfo()
        token = JSON.parse(token).token
        
        const userInfo = {...logData, ...ipInfo, ...{token: token}}

        fetch(`https://api.lazikaautoimport.com/api/v1/dealers/copart-log`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Authorization': token
          },
          body: JSON.stringify(userInfo)
        })
        .then((res) => res.json())
        .then((response) => {
            console.log(response)
        })
        .catch((err) => console.log(err))
      }

      async function getToken() {
        return new Promise((resolve) => {
          chrome.storage.local.get('token', (result) => {
            resolve(result.token)
          })
        })
      }

      async function getIPInfo() {
          const e = await fetch("https://json.geoiplookup.io/")
                          .then((e) => e.json())
                          .catch((e) => null);
          return { userIP: e.ip, userISP: e.isp, userCity: e.city, userCountry: e.country_name, userRegion: e.region, longitude: e.longitude, latitude: e.latitude };
      }

      async function logout() {

          chrome.storage.local.set({is_auth: 'false'}, () => {

              setAppInfo()
              setPopUpPage()

              // create two tabs to logout from copart and iaai

              chrome.tabs.create({ url: 'https://www.copart.com/doLogout.html' });
              chrome.tabs.create({ url: 'https://www.iaai.com/' }, (tab) => {
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  function: async () => {
                      document.cookie.split(";").forEach(function (e) {
                        document.cookie = e.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                      });
                      await fetch("/login/gbplogout", { method: "GET" });
                      window.location.reload();
                  },
                });
              })

              chrome.runtime.reload()
            
          });

      }

      async function logoutFromCopart() {

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;

            if (tabId !== undefined) {
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: () => {
                  let logout = document.getElementById('headerloggedInUserDropdown');
                  let logoutButton = logout.querySelector('.d-f-c');
                  let logoutButtonChildren = logoutButton.children;
        
                  logoutButtonChildren[0].click();
        
                  window.location.href = 'https://www.copart.com/doLogout.html';
                },
              });
            } else {
              chrome.tabs.create({ url: 'https://www.copart.com/doLogout.html' });
            }
          });

      }

      async function setPopUpPage() {

        let authCheck = JSON.parse(await getAppInfo())

          if( authCheck.authStatus ) {

              // setDefaultIcon
              chrome?.action?.setPopup({popup: 'Template/userPage.html'})

          } else {

              // setErrorIcon();
              chrome?.action?.setPopup({popup: 'Template/auth.html'})

          }

      }

      function setErrorIcon() {
        chrome.action.setIcon({ path: { 16: "/icons/error.png", 32: "/icons/error.png", 48: "/icons/error.png", 64: "/icons/error.png", 128: "/icons/error.png" } });
      }

      function setDefaultIcon() {
        chrome.action.setIcon({ path: { 16: "/icons/on.png", 32: "/icons/on.png", 48: "/icons/on.png", 64: "/icons/on.png", 128: "/icons/on.png" } });
      }

      async function parseAndLogHTML() {

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

          });

      }

      async function listenNewRoute(route){
        if (route.includes('/myBids/') || route.includes('/lotsLost/') || route.includes('/lotsWon/')) {
          chrome.storage.local.get('vehicles', (result) => {
            if(!result.vehicles){
              getVehicles()
            }
          })
        }

      }

      async function sendMessage(e, t) {
        return new Promise((a) => {
            chrome.tabs.sendMessage(e, t, () => {
                a(true);
            });
        });
      }

      async function getVehicles() {
          const apiUrl = 'https://api.lazikaautoimport.com/api/v1/dealers/copart-vehicles';

          chrome.storage.local.get('token', (result) => {
            
            fetch(apiUrl, {
              method: 'GET',
              headers: {
                  'Authorization': result.token,
                  'Content-Type': 'application/json'
              },
          })
          .then(response => response.json())
          .then(data => {
              chrome.storage.local.set({ vehicles: data })

              // Send a message to the content script with the fetched vehicles
              chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const activeTabId = tabs[0]?.id;
                chrome.tabs.sendMessage(activeTabId, { vehiclesFetched: true, vehicles: data });
            });
          })
          .catch(error => {
              console.error('Error fetching data from the API:', error);
          });

          })
      }

  // })()
} catch (e) {
    console.error(e);
}


