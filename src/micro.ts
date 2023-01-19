import http from 'http'
import path from 'path'
import fs from 'fs'
import {saveImage} from './modules/image.js'
import busboy from "busboy";

const preprocessOptions = {
    resize: {
        enabled: true,
        width: 100
    },
}

const encodeOptions = {
    mozjpeg: {}
}

http.createServer(function (req, res) {
    if (req.method === 'POST') {
        const bb = busboy({headers: req.headers})

        bb.on('file', async function (fieldName: any, file: { pipe: (arg0: fs.WriteStream) => any }, fileName: string) {
            console.log(`Для загрузки файла ${fileName} используется поле ${fieldName}`)
            const fName = fileName.split('.')[0]
            const saveTempTo = path.join(process.cwd(), path.basename(fileName))
            const saveResultTo = path.join(process.cwd(), path.basename(`${fName}.jpg`))
            await new Promise((resolve, reject) => {
                const stream = file.pipe(fs.createWriteStream(saveTempTo))
                stream.on('finish', resolve)
                stream.on('error', reject)
            })
            await saveImage(saveTempTo, saveResultTo, preprocessOptions, encodeOptions)
        })

        bb.on('finish', function () {
            res.end('Картинка обработана!')
        })

        return req.pipe(bb)
    } else if (req.method === 'GET') {
        const imageFileName = req.url ? req.url.replace(/^\//, '') : ''
        const data = fs.readFileSync(imageFileName)
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write('<html lang="en"><body><img alt="" src="data:image/jpeg;base64,')
        res.write(Buffer.from(data).toString('base64'))
        res.end('"/></body></html>')
        return
    }
    res.writeHead(404)
    res.end()
}).listen(8000, function () {
    console.log('Listen port 8000')
})