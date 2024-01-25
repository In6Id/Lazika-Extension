
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
