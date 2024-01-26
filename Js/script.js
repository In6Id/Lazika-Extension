let login = document.getElementById('username');
let password = document.getElementById('password');
let submit = document.getElementById('login');
let copartUrl = document.getElementById('copartUrl');

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

const loginAuth = async (e) => {
    e.preventDefault();
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

                const token = response.data.token;

                chrome.runtime.sendMessage({token: token})
                chrome.runtime.sendMessage({credentials: JSON.stringify(response.data)})

                window.localStorage.setItem('lazikaIsAuth', true);
                window.localStorage.setItem('token', token);
                window.localStorage.setItem('credentials', JSON.stringify(response.data.user));

                copartLogin(JSON.stringify(response.data.user), response.data.abc.username, response.data.abc.password);

            }

        })
        .catch((err) => console.log(err))


    function copartLogin(creds, username, password) {

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
            
            chrome.runtime.sendMessage({isAuth: true})
            window.localStorage.setItem('isAuth', true);
            console.log(response);
            chrome.runtime.sendMessage({credentialsData: creds})

            chrome.tabs.query({ url: 'https://www.copart.com/*' }, function (tabs) {

                if (tabs.length > 0) {
                    chrome.tabs.update(tabs[0].id, { active: true });
                } else {
                    chrome.tabs.create({ url: 'https://www.copart.com/', active: true });
                }

            });
                
                location.href = './userPage.html';

            })

        .catch((err) => console.log(err))

    }

}

submit.addEventListener('click', loginAuth)

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 13) {
        loginAuth(event);
    }
});