
import config from 'config';
import express from 'express';
import { format } from 'util';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import IAuthenticatedRequest from '../guards/authenticated.request';
import moment from "moment";

const { Storage } = require('@google-cloud/storage');

export class Util {

    public getPreSignedUrl = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            // const storage = new Storage(
            //     {
            //         projectId: config.get<string>('gcp.projectId'),
            //         keyFilename: 'for-poc-325210-a7e014fe2cab.json',
            //     }
            // );
            // const options = {
            //     version: 'v4',
            //     action: 'write',
            //     expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            //     contentType: `image/${req.body.fileType}`,
            // };


            // console.log(req.files);

            let imagePaths : any[] = [];

            // let files = JSON.parse(JSON.stringify(req.files));

            let files = req.files;
            let length : any = files.length;

            for(let i = 0; i < length; i++){


                // console.log(`files[${i}]`, files[i]);

                // @ts-ignore
                let imagePath =  await this.uploadImage(files[i]);

                imagePaths.push(imagePath);
            }
            // let imagePath =  await this.uploadImage(req.files.images);

            // console.log(image);

            // const [url] = await storage
            //     .bucket(config.get<string>('gcp.bucket'))
            //     .file(req.body.fileName)
            //     .getSignedUrl(options);

            //     console.log('###########url11111111111', `https://storage.googleapis.com/${config.get<string>('gcp.bucket')}/${req.body.fileName}`);
            //     console.log("#url",url);
            res.json({ success: true, status: 'success', url: imagePaths });
        } catch (err) {
            catchError(err, next);
        }
    }

    public makeid =(length:number)=> {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    public uploadImage = (file:any) => new Promise((resolve, reject) => {
        const { originalname, buffer } = file

        const blob = new Storage(
            {
                projectId: config.get<string>('gcp.projectId'),
                keyFilename: 'for-poc-325210-a7e014fe2cab.json',
            }
        ).bucket(config.get<string>('gcp.bucket')).file(this.makeid(9)+moment().valueOf()+"_"+originalname)
        const blobStream = blob.createWriteStream({
          resumable: false,
          contentType: `${file.mimetype}`
        }).on('finish', () => {
          const publicUrl = format(
            `https://storage.googleapis.com/${config.get<string>('gcp.bucket')}/${blob.name}`
          )
          resolve(publicUrl)
        })
        .on('error', () => {
          reject(`Unable to upload image, something went wrong`)
        })
        .end(buffer)

    })

    public getPreSignedUrlSingle = async (
        req: IAuthenticatedRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {

        try {

            let imagePaths : any[] = [];

            //@ts-ignore
            let photo = req.file;

            let imagePath =  await this.uploadImage(photo);

            imagePaths.push(imagePath);

            res.json({ success: true, status: 'success', url: imagePaths });
        } catch (err) {
            catchError(err, next);
        }
    }

}
