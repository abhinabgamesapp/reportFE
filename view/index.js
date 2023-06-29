let workersURL = 'https://hello-world-tiny-waterfall-cc7a.abinab.workers.dev';
let blockURL = 'https://blocklist.abinab.workers.dev';
let apiURL = 'http://139.59.78.148:9090'
// let apiURL = 'http://localhost:9090'

let blockUsers = {}
const filterConfiguration = {
    "playerId": "",
    "reportId": ""
}

let page = 1
let totalCount;
let oldData;
let reportIdFilterData;

window.addEventListener('DOMContentLoaded', () => {
    fetch(workersURL + `?page=${page}&type=distinct`)
        .then(async res => {
            res = await res.json()
            return res
        }).then(res => {
            let data = res.data;
            totalCount = res.data.length
            showDataOnScreen(data)
            oldData = data
        })
})

const clearFltr = document.getElementById('clearFltr');
clearFltr.addEventListener('click', () => {
    location.reload()
})

const tbody = document.getElementById('tbody')
function callAPI() {
    fetch(workersURL + `?page=${page}&type=distinct`)
        .then(async res => {
            res = await res.json()
            return res
        }).then(res => {
            let data = res.data;
            showDataOnScreen(data)
            oldData = data;
        })
}

setInterval(() => {
    if (filterConfiguration.reportId == true) {
        showDataOnReportIdFilter(reportIdFilterData[0])
    } else
        callAPI()
}, 3000)

async function showDataOnScreen(data) {
    tbody.innerHTML = ""
    for (let i = 0; i < data.length; i++) {
        checkBlockUser(data[i].to)
        if (filterConfiguration.playerId !== "" && filterConfiguration.playerId != data[i].to) {
            continue
        }

        const tr = createCustomElement('tr', [], '');
        if (blockUsers[+data[i].to] == true) {
            let th = createCustomElement('th', [], '')
            th.appendChild(createCustomElement('span', [], i + 1))
            th.appendChild(createCustomElement('span', ['bi', 'bi-circle-fill', 'mx-3', 'text-danger'], ""))
            tr.appendChild(th)
        }
        else
            tr.appendChild(createCustomElement('th', ['text-start'], i + 1))
        tr.appendChild(createCustomElement('td', ['text-start'], data[i].to))
        tr.appendChild(createCustomElement('td', [], data[i].count))

        const showTag = createCustomElement('td', ['badge', 'rounded-pill', 'bg-danger', 'm-2', 'text-start'], 'SHOW');
        showTag.setAttribute('data-toggle', "modal");
        showTag.setAttribute('data-target', '#myModal');
        showTag.setAttribute('id', data[i].to);
        showTag.style.cursor = "pointer";

        const blockListTag = createCustomElement('td', ['badge', 'rounded-pill', 'bg-dark', 'm-2'], 'BLOCK');
        blockListTag.setAttribute('id', data[i].to)
        blockListTag.style.cursor = "pointer";
        blockListTag.setAttribute('data-bs-toggle', "modal");
        blockListTag.setAttribute("data-bs-target", "#blockModal")
        blockListTag.addEventListener('click', () => {
            localStorage.setItem('blockId', blockListTag.id)
        })

        const unblockTag = createCustomElement('td', ['badge', 'rounded-pill', 'bg-success', 'm-2'], 'UNBLOCK');
        unblockTag.setAttribute('id', data[i].to)
        unblockTag.style.cursor = "pointer";
        unblockTag.setAttribute('data-bs-toggle', "modal");
        unblockTag.setAttribute("data-bs-target", "#unblockModal")

        unblockTag.addEventListener('click', () => {
            localStorage.setItem('unblockId', unblockTag.id)
        })
        showTag.addEventListener('click', () => {
            showDataOnModal(showTag.id)
        })

        tr.appendChild(showTag)
        if (blockUsers[+data[i].to] == true) {
            tr.appendChild(unblockTag)
        } else
            tr.appendChild(blockListTag)
        tbody.appendChild(tr)
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

const pendingBtn = document.getElementById('pendingBtn');
const resolvedBtn = document.getElementById('resolvedBtn');
const reviewBtn = document.getElementById('reviewBtn');

pendingBtn.addEventListener('click', async () => {
    const reportId = localStorage.getItem('reportId');
    await updateStatus(reportId, "PENDING")
    showDataOnModal(localStorage.getItem('playerId'))
})

reviewBtn.addEventListener('click', async () => {
    const reportId = localStorage.getItem('reportId');
    await updateStatus(reportId, "IN_REVIEW")
    showDataOnModal(localStorage.getItem('playerId'))
})

resolvedBtn.addEventListener('click', async () => {
    const reportId = localStorage.getItem('reportId');
    await updateStatus(reportId, "RESOLVED")
    showDataOnModal(localStorage.getItem('playerId'))

})

const modalTable = document.getElementById('modaltable');
const statusModalBody = document.getElementById('status-modal-body');
async function showDataOnModal(playerId) {
    const response = await fetch(workersURL + `?page=${page}&type=playerId&playerId=${playerId}`)
    const jsonData = await response.json();
    console.log(jsonData)
    modalTable.innerHTML = ""
    for (let i = 0; i < jsonData.length; i++) {
        const tr = createCustomElement('tr', [], '');
        tr.setAttribute('id', jsonData[i].to)
        tr.appendChild(createCustomElement('th', [], jsonData[i].from))
        tr.appendChild(createCustomElement('td', [], jsonData[i].to))
        tr.appendChild(createCustomElement('td', [], jsonData[i].reason))
        tr.appendChild(createCustomElement('td', [], jsonData[i].reportId))
        tr.appendChild(createCustomElement('td', [], jsonData[i].message))

        const statusTag = (createCustomElement('td', ['badge', 'rounded-pill', 'm-2', 'text-end'], jsonData[i].status))
        if (jsonData[i].status == "PENDING")
            statusTag.classList.add('bg-secondary')
        else if (jsonData[i].status == "IN_REVIEW")
            statusTag.classList.add('bg-warning')
        else
            statusTag.classList.add('bg-danger')
        statusTag.style.cursor = "pointer";
        statusTag.setAttribute('data-toggle', "modal");
        statusTag.setAttribute('data-target', '#updateStatusModal');
        statusTag.setAttribute('id', jsonData[i].reportId)
        statusTag.addEventListener('click', () => {
            localStorage.setItem('reportId', statusTag.id)
            localStorage.setItem('playerId', tr.id)
        })

        tr.appendChild(statusTag)
        modalTable.appendChild(tr)
    }

}

async function updateStatus(reportId, status) {
    const response = await fetch(workersURL, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            "type": "status",
            "reportId": reportId,
            "status": status
        }),
    });
    console.log(response)
}

const playerIdFilter = document.getElementById('playerIdFilter');
playerIdFilter.addEventListener('keyup', async (event) => {
    if (event.key == "Enter") {
        const playerId = playerIdFilter.value;
        filterConfiguration.playerId = playerId;
        showDataOnScreen(oldData)
    }
})

const reportIdFilter = document.getElementById('reportIdfilter');
reportIdFilter.addEventListener('keyup', async (event) => {
    if (event.key == "Enter") {
        const reportId = reportIdFilter.value;
        filterConfiguration.reportId = true;
        const response = await fetch(workersURL + `?type=reportId&reportId=${reportId}`)
        const jsonData = await response.json()
        reportIdFilterData = jsonData;
        showDataOnReportIdFilter(jsonData[0])
        if (jsonData.length == 0) {
            showErrorNotification('No data found')
        }
    }
})

function showErrorNotification(text) {
    const notificationDiv = document.getElementById('notification');
    notificationDiv.appendChild(createCustomElement('h3', ['text-danger'], text))
    setTimeout(() => {
        notificationDiv.innerHTML = " "
    }, 3000)
}

async function checkBlockUser(playerId) {
    const response = await fetch(blockURL + `?type=one&playerId=${playerId}`)
    const jsonResponse = await response.json()
    if (jsonResponse.document) {
        blockUsers[playerId] = true
    } else
        blockUsers[playerId] = false
}

const blockBtn = document.getElementById('blockModalBtn');
blockBtn.addEventListener('click', async (event) => {
    event.preventDefault()
    const playerId = localStorage.getItem('blockId')
    const message = document.getElementById('blockModalMsg').value;
    const authKey = document.getElementById('blockModalAuthKey').value;
    const response = await fetch(apiURL + '/blockUser', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            "playerId": playerId,
            "message": message,
            "auth": authKey
        }),
    });
    const jsonResponse = await response.json()
    console.log(jsonResponse)
    if (jsonResponse.message == "BLOCKED") {
        showErrorNotification("Successfully Blocked")
        showDataOnScreen(oldData)
        location.reload()
    }
    else
        alert("Auth key is incorrect")
})

const unblockBtn = document.getElementById('unblockModalBtn');
unblockBtn.addEventListener('click', async (event) => {
    event.preventDefault()
    const playerId = localStorage.getItem('unblockId')
    const message = document.getElementById('unblockMsg').value;
    const authKey = document.getElementById('unblockAuth').value;
    const response = await fetch(apiURL + '/unblockUser', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            "playerId": playerId,
            "message": message,
            "auth": authKey
        }),
    });
    const jsonResponse = await response.json()
    console.log(jsonResponse.message)
    if (jsonResponse.message == "UNBLOCKED") {
        showErrorNotification("Succesfully Unblocked")
        showDataOnScreen(oldData)
        location.reload()
    }
    else {
        alert('Auth key is incorrect')
    }

})

function showDataOnReportIdFilter(data) {
    tbody.innerHTML = ""
    const tr = createCustomElement('tr', [], '');
    tr.setAttribute('id', data.to)
    tr.appendChild(createCustomElement('th', [], data.from))
    tr.appendChild(createCustomElement('td', [], data.to))
    tr.appendChild(createCustomElement('td', [], data.reason))
    tr.appendChild(createCustomElement('td', [], data.reportId))
    tr.appendChild(createCustomElement('td', [], data.message))

    const statusTag = (createCustomElement('td', ['badge', 'rounded-pill', 'bg-success', 'm-2', 'text-end'], data.status))
    statusTag.style.cursor = "pointer";
    statusTag.setAttribute('data-toggle', "modal");
    statusTag.setAttribute('data-target', '#updateStatusModal');
    statusTag.setAttribute('id', data.reportId)
    statusTag.addEventListener('click', () => {
        localStorage.setItem('reportId', statusTag.id)
        localStorage.setItem('playerId', tr.id)
    })

    tr.appendChild(statusTag)
    tbody.appendChild(tr)
}