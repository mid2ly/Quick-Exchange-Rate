let from = null;
let to = "EUR";
let amount = null;

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
    if (payload.type === 'update') {
        from = payload.from;
        amount = payload.amount;

        chrome.storage.sync.get(["to"])
            .then(result => to = result.to != null ? result.to : to)
            .then(update)
    } 

    return true;
});

function update() {
    document.getElementById("from").value = from;
    document.getElementById("amount").innerText = Number.parseFloat(amount).toLocaleString();
    document.getElementById("to").value = to;

    convertExchange(from, to, amount).then(result => {
        document.getElementById("result").innerText = Number.parseFloat(result).toLocaleString();
    })
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ type: "ready" });

    document.getElementById("from").addEventListener("change", () => {
        const value = document.getElementById("from").value
        from = value
        update();
    })

    document.getElementById("to").addEventListener("change", () => {
        const value = document.getElementById("to").value
        to = value
        chrome.storage.sync.set({ to: value })
                .then(() => console.log("saved 'to'"))
                .then(update)
    })
});

function getExchangeRates() {
    return chrome.storage.sync.get(["eurofxref", "lastUpdated"])
    .then(async (result) => {
        const lastUpdated = new Date(result.lastUpdated)
        let diff = Math.abs(new Date().getTime() - lastUpdated.getTime())
        diff = Number.parseInt(diff / (1000 * 60 * 60 * 24))

        return result.eurofxref != null && diff < 1 ? result.eurofxref : await callExcnahgeRates()
    })
}

function callExcnahgeRates() {
    const reqURL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
    return fetch(reqURL, { mode: 'cors' })
        .then(response => response.text())
        .then(text => {
            const result = { EUR: 1 }
            const regex = /<Cube currency='(.+)' rate='([\d\.]+)'\/>/gm
            while ((m = regex.exec(text)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++
                }
                
                result[m[1]] = Number.parseFloat(m[2])
            }

            return result
        }).then(result => {
            chrome.storage.sync.set({ eurofxref: result })
                .then(() => 
                    chrome.storage.sync.set({ lastUpdated: new Date().toISOString() })
                )
                .then(() => console.log("saved eurofxref"))
            
            return result
        })
}

async function convertExchange(from, to, amount) {
    const excahngeRate = await getExchangeRates()
    const fromRate = excahngeRate[from]
    const toRate = excahngeRate[to]

    return ((1 / fromRate) * toRate * amount).toFixed(2)
}