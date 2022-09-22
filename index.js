const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const app = new express()
app.use(cors())
dotenv.config()

const googleUrl = '1bX-db7LGhGMwocvpr_0izm6zWXyrjw4rlTb50Qt0SMA'
async function loadData() {
    const doc = new GoogleSpreadsheet(googleUrl);
    doc.useApiKey(process.env.GOOGLE_API_KEY);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadCells('A1:J30')
    let resultRowIndex
    let daos = []
    for (i = 2; i < 30; i++) {
        const daoName = await sheet.getCell(i, 1)
        if (daoName.value === 'ИТОГО') {
            resultRowIndex = i
            break
        } else {
            daos.push(daoName.value)
        }
    }
    
    const currentUsers = parseFloat(String(sheet.getCell(resultRowIndex, 3).value).replace(/ /g,"").replace(/,/g,"."))
    const aum = parseFloat(String(sheet.getCell(resultRowIndex, 4).value).replace(/ /g,"").replace(/,/g,"."))
    const totalTransactionVolume = parseFloat(String(sheet.getCell(resultRowIndex, 5).value).replace(/ /g,"").replace(/,/g,"."))
    const votesCastByCommunity = parseFloat(String(sheet.getCell(resultRowIndex, 9).value).replace(/ /g,"").replace(/,/g,"."))

    const daoInfo = {
        DAOVaults: daos.length,
        currentUsers,
        aum: Math.round(aum / 100000) / 10,
        totalTransactionVolume: Math.round(totalTransactionVolume / 100000) / 10,
        votesCastByCommunity
    }

    return daoInfo
}
async function loadDataHistory() {
    let data = []
    const rows = 300
    const doc = new GoogleSpreadsheet(googleUrl);
    doc.useApiKey(process.env.GOOGLE_API_KEY);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadCells('A1:J'+rows)
    
    let resultRowIndex
    let daos = []
    for (i = 2; i < rows; i++) {
        const daoName = await sheet.getCell(i, 1)
        if (daoName.value === 'ИТОГО') {
            resultRowIndex = i
            const date =  sheet.getCell(resultRowIndex, 0).formattedValue
            const currentUsers = parseFloat(String(sheet.getCell(resultRowIndex, 3).value).replace(/ /g,"").replace(/,/g,"."))
            const aum = parseFloat(String(sheet.getCell(resultRowIndex, 4).value).replace(/ /g,"").replace(/,/g,"."))
            const totalTransactionVolume = parseFloat(String(sheet.getCell(resultRowIndex, 5).value).replace(/ /g,"").replace(/,/g,"."))
            const votesCastByCommunity = parseFloat(String(sheet.getCell(resultRowIndex, 9).value).replace(/ /g,"").replace(/,/g,"."))

            const daoInfo = {
                date,
                DAOVaults: daos.length,
                currentUsers,
                aum: Math.round(aum / 100000) / 10,
                aumS: String(sheet.getCell(resultRowIndex, 4).value).replace(/ /g,""),
                totalTransactionVolume: Math.round(totalTransactionVolume / 100000) / 10,
                totalTransactionVolumeS: String(sheet.getCell(resultRowIndex, 5).value).replace(/ /g,""),
                votesCastByCommunity
            }
            daos = []
            data.push(daoInfo)
        } else {
            daos.push(daoName.value)
        }
    
    
    }


    return data
}

(async function () {
    console.log(await loadDataHistory())
}())

app.use(express.json({ limit: '10mb' }))
app.get('/dao-info', async (req, res) => {
    res.status(200).send(await loadData())
})
app.get('/dao-history', async (req, res) => {
    res.status(200).send(await loadDataHistory())
})
let port = process.env.PORT || 30001
app.listen(port, function () {
    console.log("DAO API Server ready on port " + port)

})
