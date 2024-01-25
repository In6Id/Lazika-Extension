// contentScript.js

let a = document.querySelector('#top')
let b = a?.querySelector('.logo')
let c = b?.querySelector('a')
let d = c?.querySelector('img')

d.src ? d.src = 'https://lazikaautoimport.com/static/media/logo.1e6322f5dacbd17bb435.png' : null
d ? d.style.width = '60px' : null
d ? d.style.height = '60px' : null

console.log(d);

if(document.getElementById('headerloggedInUserDropdown').querySelector('.d-f-c').children.length > 1) {
    let menu = document.getElementById('headerloggedInUserDropdown')
    let spans = menu.querySelector('.d-f-c')
    let childrens = spans.children

    for(let i = 0; i < 4; i++) {
        childrens[0].remove()
    }
}

let footer = document.getElementById('footer-container')
footer.remove()

let headerloggedInUserDropdown = document.getElementById('headerloggedInUserDropdown')
headerloggedInUserDropdown.style.display = 'none'


// chrome.runtime.sendMessage({ htmlContent: pageHTML });


// function appendLazikaButton() {
//     const lazikaButton = document.createElement('a');
//     lazikaButton.className = 'btn btn-lblue';
//     lazikaButton.style.backgroundColor = '#dc2626';
//     lazikaButton.style.color = 'white';
//     lazikaButton.textContent = 'Lazika';
//     lazikaButton.addEventListener('click', showExtension);

//     const dropdownMenu = document.querySelector('.signin.sign-in-btn .boxlg');
//     if (dropdownMenu) {
//         dropdownMenu.insertBefore(lazikaButton, dropdownMenu.firstChild);
//     }        

// }
// function showExtension() {
//     chrome.runtime.sendMessage({ openExtension: true });
// }

// if(window.localStorage.getItem('isAuth') == 'false') {
//     appendLazikaButton();
// }

// if(window.localStorage.getItem('isAuth') == 'false'){
//         const modal = document.createElement('div');
//         modal.id = 'authModal';

//         fetch('../Template/auth.html')
//         .then(response => response.text())
//         .then(htmlContent => {
//             modal.innerHTML = htmlContent;

//             // Apply styles to the modal
//             modal.style.position = 'fixed';
//             modal.style.top = '50%';
//             modal.style.left = '50%';
//             modal.style.transform = 'translate(-50%, -50%)';
//             modal.style.backgroundColor = 'white';
//             modal.style.padding = '20px';
//             modal.style.border = '1px solid #ccc';
//             modal.style.zIndex = '1001';


//             const backdrop = document.createElement('div');
//             backdrop.classList.add('backdrop');

//             backdrop.style.position = 'fixed';
//             backdrop.style.top = '0';
//             backdrop.style.left = '0';
//             backdrop.style.width = '100%';
//             backdrop.style.height = '100%';
//             backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
//             backdrop.style.zIndex = '1000';
//             backdrop.style.backdropFilter = 'blur(2px)'; // Adjust the blur effect

//             document.body.appendChild(modal);
//             document.body.appendChild(backdrop);

//             // Show the modal
//             modal.style.display = 'block';
//         })
//         .catch(error => console.error('Error fetching auth.html:', error));
// }else{
//     console.log(window.localStorage.getItem('isAuth'))
// }