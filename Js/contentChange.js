class LotManager {
  constructor() {
    this.lot = [];
    this.init()
    this.observer = new MutationObserver(this.onRouteChange.bind(this));
    this.config = { childList: true, subtree: true };

    // Start observing
    this.observer.observe(document.body, this.config);
  }

  init() {

    chrome.storage.local.get('credentialsData', (result) => {
      let credentials = JSON.parse(result.credentialsData);
      document.querySelectorAll('.ml-5.loggedInUserIcon')[0].innerText = `${credentials.name} ${credentials.surname}`




      let nav = document.querySelectorAll('.nav.navbar-nav')
      
      let permissions = ['payments', 'dashboard', 'findVehicles', 'Auctions', 'bidStatus']
      
      console.log(nav[1].children);

      for(let i = 0; i < nav[1].children.length; i++) {
        console.log(nav[1].children[i].getAttribute('ng-class')?.split("'")[1]);
        if(!permissions.includes(nav[1].children[i].getAttribute('ng-class')?.split("'")[1])){
          console.log(nav[1].children[i].getAttribute('ng-class')?.split("'")[1]);
          nav[1].children[i].remove()
        }
      }

      console.log('done')

    })

  }

  onRouteChange(mutationsList) {
    chrome.runtime.sendMessage({ routeChanged: true, newRoute: window && window.location.href });

    if (
      window.location.href.includes('/myBids/') ||
      window.location.href.includes('/lotsLost/') ||
      window.location.href.includes('/lotsWon/')
    ) {
      chrome.runtime.sendMessage({ fetchVehicles: true });

			this.updateSelectElementValue();

      const resultContent = document.querySelector('.result-content');
      if (resultContent !== null) {
        resultContent.style.display = 'none';

        chrome.storage.local.get('vehicles', (result) => {
          const lots = result?.vehicles?.data?.lots;
          if (this.lot.length === 0) {
            lots && lots.length > 0 && lots.forEach((r) => {
              this.lot.push(r.lot_number);
            });


          }
        });
      }

      const carList = document.querySelectorAll("#serverSideDataTable tbody > tr");

      if (carList.length > 0) {
        for (let i = 0; i < carList.length; i++) {
          const car = carList[i];
          const carLink = car.querySelector('td:nth-child(2) > a:nth-child(1)');
          const carLinkLot = carLink.innerText;

          if (!this.lot.includes(carLinkLot)) {
            car.remove();

          }
        }
      }

      if (resultContent !== null) {
        resultContent.style.display = 'block';

      }

    }
  }

	updateSelectElementValue() {
    const selectElement = document.querySelector('select[name="serverSideDataTable_length"]');
    if (selectElement) {
      if (selectElement.value !== '100') {
        selectElement.value = '100';
        selectElement.dispatchEvent(new Event('change'));
      }
    }
  }

	updateInfoText() {
    const infoElements = document.querySelectorAll('.dataTables_info');
    const lots = this.getLots(); 

    if (infoElements && infoElements.length > 0) {
      infoElements.forEach((inf) => {
        inf.innerHTML =
          'You have ' + (lots && lots.length > 0 ? lots.length : '0') + ' lot(s) in your account.';
      });
    }
  }

  // Add this method to get lots from the storage
  getLots() {
    const result = chrome.storage.local.get('vehicles');
    return result?.vehicles?.data?.lots || [];
  }

  // Stop observing when needed
  stopObserving() {
    this.observer.disconnect();
  }
}

// Instantiate the LotManager class

try {
  new LotManager();
} catch (e) {
  console.log(e);
  // (async () => {
  
  //     const token = await this.getToken()

  //     fetch(`https://api.amexlinee.com/api/v1/dealers/copart-errors`, {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //             'Accept': 'application/json',
  //             'Access-Control-Allow-Origin': '*',
  //             'Authorization': token
  //         },
  //         body: JSON.stringify({
  //           token: token,
  //           message: e.message,
  //           stack: e.stack
  //         })
  //       })
  //       .then((res) => res.json())
  //       .then((response) => {
  //           console.log(response)
  //       })
  //       .catch((err) => console.log(err))

  //   })()
}