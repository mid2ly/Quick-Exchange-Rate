const currencies = {
    EUR: ["EUR", "€"],
    USD: ["USD", "$", "US$", "＄"],
    CAD: ["CAD", "$", "＄", "Can$", "C$", "CA$"],
    AUD: ["AUD", "$", "＄"],
    MXN: ["MXN", "$", "＄", "MX$", "Mex$"],
    NZD: ["NZD", "$", "＄"],
    SGD: ["SGD", "S$", "$", "＄"],
    JPY: ["JPY", "¥", "円", "圓", "￥"],
    BGN: ["BGN", "лв"],
    CZK: ["CZK", "Kč"],
    DKK: ["DKK", "kr"],
    GBP: ["GBP", "£"],
    HUF: ["HUF", "Ft"],
    PLN: ["PLN", "zł"],
    RON: ["RON", "L"],
    SEK: ["SEK", "kr"],
    CHF: ["CHF", "Fr"],
    ISK: ["ISK", "kr"],
    NOK: ["NOK", "kr"],
    TRY: ["TRY", "₺", "TL"],
    BRL: ["BRL", "R$"],
    CNY: ["CNY", "¥"],
    HKD: ["HKD", "HK$"],
    IDR: ["IDR", "Rp"],
    ILS: ["ILS", "₪"],
    INR: ["INR", "Rs"],
    KRW: ["KRW", "₩", "원", "won", "￦"],
    MYR: ["MYR", "RM"],
    PHP: ["PHP", "₱"],
    THB: ["THB", "฿"],
    ZAR: ["ZAR", "R"],
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "openSidePanel",
        title: chrome.i18n.getMessage('toExchange'),
        contexts:["selection"],
    })
  })

let from = "EUR"
let amount = 0

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
    if (payload.type === 'ready') {
        sendPanel(from, amount)
    }

    return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selectionText = info.selectionText
    from = getCurreny(selectionText)
    amount = getAmount(selectionText)
    
    chrome.sidePanel.open({ tabId: tab.id }, () => {
        if (from == null) {
            sendPanel("EUR", 0)
            return;
        }

        sendPanel(from, amount)
    })
})

function sendPanel(from, amount) {
    chrome.runtime.sendMessage(
        {
            type: "update",
            from: from,
            amount: amount
        }
    );
}

function getAmount(text) {
    return Number.parseFloat(text.replace(/[^\d\.]/gi, ""))
}

function getCurreny(text) {
    for (const key in currencies) {
        if (Object.hasOwnProperty.call(currencies, key)) {
            const element = currencies[key]
            for (const iterator of element) {
                if (text.indexOf(iterator) != -1) {
                    return key
                }
            }
        }
    }

    return null
}