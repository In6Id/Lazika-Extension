// chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     func: () => {
//       if (!window.location.href.startsWith('https://copart.com')) {
//         // This is not copart.com, disable or hide your extension's UI here
//          // If you want to disable the extension entirely:
//         chrome.runtime.sendMessage({disableExtension: true});
//         // If you want to hide the extension's UI:
//         chrome.runtime.sendMessage({hideExtension: true});
//         console.log('not copart.com');
        
//       }
//     }
//   });

console.log('content script is running');

if(!window.localStorage.getItem('isAuth')) {
    window.localStorage.setItem('isAuth', false);
}else{
    if(window.localStorage.getItem('isAuth') == 'true') {
        chrome?.action?.setPopup({popup: 'Template/userPage.html'})
    } else {
        chrome?.action?.setPopup({popup: 'Template/auth.html'})
    }
}
