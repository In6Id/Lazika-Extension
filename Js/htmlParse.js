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
// headerloggedInUserDropdown.style.display = 'none'

