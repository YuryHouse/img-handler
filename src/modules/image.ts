import { ImagePool } from '@squoosh/lib'
import { PathLike } from 'fs'
import fs from 'fs/promises'
import {cpus} from 'os'

async function openImage(path: PathLike | fs.FileHandle, pool: ImagePool) {
    const file = await fs.readFile(path)
    return pool.ingestImage(file)
}

async function processImage(image: any, preOpt: any, encOpt: any) {
    await image.decoded
    await image.preprocess(preOpt)
    await image.encode(encOpt)
    return image
}

async function saveIntoJpeg(image: { encodedWith: { mozjpeg: any } }, path: PathLike | fs.FileHandle) {
    const rawEncodedImage = (await image.encodedWith.mozjpeg).binary
    return fs.writeFile(path, rawEncodedImage)
}

export async function saveImage(unprocessedImagePath: PathLike | fs.FileHandle, processedImagePath: PathLike | fs.FileHandle, preOpt: { resize: { enabled: boolean; width: number } }, encOpt: { mozjpeg: {} }) {
    const imagePool = new ImagePool(cpus().length)
    const image = await openImage(unprocessedImagePath, imagePool)
    const processedImage = await processImage(image, preOpt, encOpt)
    await saveIntoJpeg(processedImage, processedImagePath)
    await imagePool.close()
}