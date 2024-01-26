let copartUrl = document.getElementById('copartUrl');

copartUrl.addEventListener('click', (e) => {
    e.preventDefault();

    chrome.tabs.create({
        url: 'https://www.copart.com/',
        active: true
    })
})

let logout = document.getElementById('logoutExt');

logout.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log(logout, e)
    // window.href = 'https://www.copart.com/doLogout.html'
    chrome.runtime.sendMessage({logout: true})
    location.href = './auth.html';
    window.localStorage.setItem('isAuth', false);
    
})

let credentials = JSON.parse(window.localStorage.getItem('credentials'));

if(credentials) {
    let user = document.getElementById('user');
    let amexId = document.getElementById('amexId');

    user.textContent = `${credentials.name} ${credentials.surname}`;
    amexId.textContent = credentials.id;

}
