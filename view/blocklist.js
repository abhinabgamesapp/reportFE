// const apiURl = 'http://localhost:9090';
let blockURL = 'https://blocklist.abinab.workers.dev';
window.addEventListener('DOMContentLoaded', () => {
    fetch('http://127.0.0.1:8787/?type=all')
        .then(async res => {
            res = await res.json()
            return res
        })
        .then(res => {
            console.log(res)
            showAllBlockUsers(res.documents)
        })
})

const blockUserTable = document.getElementById('blockUserTable');
function showAllBlockUsers(data) {
    for (let i = 0; i < data.length; i++) {
        const tr = createCustomElement('tr', [], '')
        tr.appendChild(createCustomElement('th', [], data[i].playerId))
        tr.appendChild(createCustomElement('th', [], data[i].message))
        tr.appendChild(createCustomElement('th', [], data[i].ip))
        blockUserTable.appendChild(tr)
    }
}

function createCustomElement(ele, classes, text) {
    const element = document.createElement(ele);
    for (let i = 0; i < classes.length; i++) {
        element.classList.add(classes[i])
    }
    element.innerText = text;
    return element
}
