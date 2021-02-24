import fs from 'fs'
import ncp from 'ncp'
import path from 'path'

export default function getAllFiles (currentDir, dirPath, parcelFunction, arrayOfFiles) {
    const files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            if (file === 'images') {
                const staticDir = dirPath.substring(0, dirPath.lastIndexOf('/')) + '/static'
                const currentFile = dirPath + '/' + file
                const destination = staticDir + '/' + file
                if (!fs.existsSync(destination)) {
                    fs.mkdirSync(destination, { recursive: true })
                } else {
                    fs.rmdirSync(destination, { recursive: true })
                    fs.mkdirSync(destination, { recursive: true })
                }
                ncp(currentFile, destination, function (err) {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log('success!')
                    }
                })
            } else {
                parcelFunction(dirPath + '/' + file)
                arrayOfFiles = getAllFiles(currentDir, dirPath + '/' + file, parcelFunction, arrayOfFiles)
            }
        } else {
            arrayOfFiles.push(path.join(dirPath, '/', file))
        }
    })
    return arrayOfFiles
}
