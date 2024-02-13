"use strict";

try {
    (
        async () => {
    
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
                fetch(`https://api.lazikaautoimport.com/api/v1/auth/login?username=${login.value}&password=${password.value}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                })
                .then((res) => res.json())
                .then(async (response) => {
    
                    Swal.fire({
                        title: "Oops...",
                        text: response.message,
                        width: '200px',
                    });
    
                    if(response.status) {
    
                        const token = response.data.token;
    
                        const res = await promise(
                            {
                                get: 'login',
                                token: token,
                                credentials: JSON.stringify(response.data.user)
                            }
                        )
                        
                        if ( res ) {
                            location.href = './userPage.html';
                            chrome.runtime.reload();
                        }

                    }
    
                })
                .catch((err) => Swal.fire({
                    title: "Oops...",
                    text: err,
                    width: '200px',
                }))
    
        }
    
        async function promise(e) {
            return new Promise((t) => {
                chrome.runtime.sendMessage(e, (e) => {
                    t(e);
                });
            });
        }
    
        submit.addEventListener('click', loginAuth)
    
        document.addEventListener('keydown', function (event) {
            if (event.keyCode == 13) {
                loginAuth(event);
            }
        });

        let reloadButton = document.getElementById('reload');

        reloadButton.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.runtime.reload();
        })
    
    }
    )()
} catch (error) {
    console.log('Error: ', error);
}