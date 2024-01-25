class Background {

  constructor() {
      
      this.events()
      this.init()
  }

  init() {

      console.log("background.js loaded")

      this.setPopUpPage()

  }

  events() {

      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

            chrome.runtime.setUninstallURL('https://www.copart.com/doLogout.html');
        

            if (message.isAuth) {
              console.log('logged in')
              this.authorization();
            }

            if (message.htmlContent) {
              message.htmlContent = false;
              console.log("Received HTML content:", message.htmlContent);
            } 

            if(message.logout) {
              message.logout = false;
              console.log('logout')
              this.logout()
            }

            if(message.checkAuth) {
              message.checkAuth = false;
              this.setPopUpPage()
            }

            if(message.logoutFromCopart) {
              message.logoutFromCopart = false;
              console.log('logout from copart')
              this.logoutFromCopart()
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
                  this.getVehicles()
                }
              });
            }

            if(message.get === 'sendLogBid') {
              this.sendBidLog(message.logData);
            }

            if(message.get === 'checkControlPrebid') {}
            if(message.get === 'getAppInfo') {}
            if(message.get === 'getUserConfig') {}
            if(message.get === 'setUserConfig') {}
            if(message.get === 'sendLogBid') {}
            if(message.get === 'sendLogPaymentDue') {}
            if(message.get === 'check_auth') {}
            if(message.get === 'reInitPageLog') {}
            if(message.get === 'reInitDue') {}
            if(message.get === 'authCheck') {
              chrome.storage.local.get('is_auth', (result) => {
                console.log(result);
                sendResponse(result.is_auth)
              })
            }

      });

  }

  setPopUpPermissions(tab) {
    if (tab?.discarded) return;
    if (tab?.url && (tab?.url.includes("copart.com"))) chrome.action.enable(tab?.id);
    else chrome.action.disable(tab?.id);
  }

  authorization() {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

          // this.setPopUpPermissions(tabs[0]);

          chrome.storage.local.set({is_auth: 'true'}, () => {

              chrome.tabs.reload(tabs[0]?.id);
              this.parseAndLogHTML()
              this.setPopUpPage()

          });
      });

  }

  async sendBidLog(logData) {

    const ipInfo = await this.getIPInfo()
    const token = await this.getToken()
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

  async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get('token', (result) => {
        resolve(result.token)
      })
    })
  }

  async getIPInfo() {
      const e = await fetch("https://json.geoiplookup.io/")
                      .then((e) => e.json())
                      .catch((e) => null);
      return { userIP: e.ip, userISP: e.isp, userCity: e.city, userCountry: e.country_name, userRegion: e.region, longitude: e.longitude, latitude: e.latitude };
  }

  logout() {

      chrome.storage.local.set({is_auth: 'false'}, () => {

          this.setPopUpPage()

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            this.logoutFromCopart()
          });
        
      });

  }

  logoutFromCopart() {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        chrome.scripting.executeScript({
            target: { tabId: tabs[0]?.id },
            function: () => {

              let logout = document.getElementById('headerloggedInUserDropdown')
              let logoutButton = logout.querySelector('.d-f-c')
              let logoutButtonChildren = logoutButton.children

              logoutButtonChildren[0].click()

              window.href = 'https://www.copart.com/doLogout.html'
              
            },

        });

      });

  }

  setPopUpPage() {

      chrome.storage.local.get('is_auth', (result) => {

          if(result.is_auth == 'true') {
              chrome?.action?.setPopup({popup: 'Template/userPage.html'})
          } else {
              chrome?.action?.setPopup({popup: 'Template/auth.html'})
          }

      })

  }

  parseAndLogHTML() {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {


      });

  }

  listenNewRoute(route){
		if (route.includes('/myBids/') || route.includes('/lotsLost/') || route.includes('/lotsWon/')) {
      chrome.storage.local.get('vehicles', (result) => {
        if(!result.vehicles){
          this.getVehicles()
        }
      })
		}

  }

  getVehicles() {
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

}

try {
  new Background()
} catch (error) {
  console.log(error);
}
