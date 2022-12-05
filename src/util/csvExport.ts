import { Parser } from "json2csv";
import { join, dirname } from "path";
import { writeFile, unlink, readFileSync } from 'fs';
const stripe = require('stripe')(process.env.stripeKey as string, {apiVersion: '2020-08-27'});

export const generateCSV = (data: any, fields: any) => new Promise(async (resolve, reject) => {
  const csvParser = new Parser({ fields });
  const csv = csvParser.parse(data);
  if (csv) {
    resolve(csv);
  } else {
    reject('error')
  }
});

export const saveFile = (csvFile: any) => new Promise(async (resolve, reject) => {
  const dateTime = new Date().toISOString().slice(-24).replace(/\D/g,
    '').slice(0, 14);
  const filePath = join(__dirname, "../", "assets", "exports", `csv-${dateTime}.csv`);
  writeFile(filePath, csvFile, (err: any) => {
    if (err) {
      return reject(err);
    }
    setTimeout(() => {
      unlink(filePath, (err) => {
        if (err) {
          console.error(err);
        }
        console.log('File has been Deleted');
      });
    }, 600000);
    return resolve({ fileName: `csv-${dateTime}.csv` })
  })
});

export const downloadCsv = (req: any, res: any) => {
  try {
    let { fileName } = req.params;
    const pathname = './src/assets/exports';
    const dirName: any = require.main?.filename;
    const dir = join(dirname(dirName), pathname);
    var pdfpath = `${dir}/${fileName}`;
    res.sendFile(pdfpath);
  } catch (error: any) {
    console.log(error);
  }
}

export const uploadFileToStripe = async () => {
  const fp = readFileSync('/home/anshul/Downloads/download2.jpeg');
  console.log('fp ====>>>>>.', fp);
  const upload = await stripe.files.create({
    file: {
      data: fp,
      name: 'file.jpg',
      type: 'application.octet-stream',
    },
    purpose: 'identity_document',
  });
  // identity_document
  // account_requirement
  console.log('upload ====>>>>', upload);
}
