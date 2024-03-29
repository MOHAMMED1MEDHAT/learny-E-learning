const axios = require("axios");
const path = require("path");
const fs = require("fs");
// const download = require("image-downloader");
const PdfDocument = require("pdfkit");
const { createCanvas, loadImage } = require("canvas");
const { cloudinary } = require("./../util/uploadHandler");
// const request = require("request");

//TODO:Remove that fucking callback hell (done)
exports.createCertificate = async ({ certificateLink, name }) => {
    try {
        let userCertificateLink = "";
        //1- download the certificate

        const filename = await downloadImage(
            certificateLink,
            `${path.dirname(
                __dirname
            )}/assets/images/${Date.now()}${path.extname(certificateLink)}`
        );
        // console.log(filename);
        //2- write user name on certificate
        //LOAD MODULES
        //SETTINGS - CHANGE FONT TO YOUR OWN!
        const sFile = filename; // source image
        const sSave = filename.replace("images", "pdfs"); // "save as"
        const sText = name; // text to write
        const sX = 380; // text position x
        const sY = 80; // text position y

        // //LOAD IMAGE + DRAW TEXT
        const img = await loadImage(sFile);
        //CREATE CANVAS + DRAW IMAGE
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        //TEXT DIMENSIONS
        ctx.font = "100px Arial";
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(0, 0, 0)";
        let td = ctx.measureText(sText),
            tw = td.width,
            th = td.actualBoundingBoxAscent + td.actualBoundingBoxDescent;

        //CALCULATE CENTER & WRITE ON CENTER
        let x = Math.floor((img.naturalWidth - tw) / 2),
            y = Math.floor((img.naturalHeight - th) / 2);
        ctx.strokeText(sText, x, y);
        ctx.fillText(sText, x, y);

        // SAVE
        const out = fs.createWriteStream(sSave);
        const stream = canvas.createJPEGStream();
        stream.pipe(out);
        out.on("finish", () => console.log("Done"));

        //3-save certificate to cloud
        await cloudinary.uploader.upload(
            `${filename.replace("images", "pdfs")}`,
            (error, result) => {
                if (error) {
                    throw new Error(error.message);
                }
                userCertificateLink = result.url;
                // console.log(result.url);
            }
        );
        //4-delete all certificate assets from local storage (images,pdfs)
        //delete from images
        fs.unlink(filename, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
                return;
            }
        });

        //delete from pdfs
        fs.unlink(filename.replace("images", "pdfs"), (err) => {
            if (err) {
                console.error("Error deleting file:", err);
                return;
            }
        });

        return { userCertificateLink };
    } catch (error) {
        // console.log(error, error.stack);
        throw new Error("Error in creating certificateLink", error.message);
    }
};

exports.downloadImageAsPdf = async ({ certificateLink }) => {
    //1- download the certificate
    const filename = await downloadImage(
        certificateLink,
        `${path.dirname(__dirname)}/assets/images/${Date.now()}${path.extname(
            certificateLink
        )}`
    );

    //2- convert Image to pdf
    const doc = new PdfDocument({ size: [1024, 768] });
    doc.pipe(
        fs.createWriteStream(
            filename.replace("images", "pdfs").replace(".jpg", ".pdf")
        )
    );
    doc.image(filename, 0, 0, {
        fit: [1024, 768],
    })
        .rect(0, 0, 1023, 766)
        .stroke();
    doc.end();

    return filename.replace("images", "pdfs").replace(".jpg", ".pdf");
};

async function downloadImage(url, filename) {
    const filePath = path.resolve(filename);
    const response = await axios.get(url, { responseType: "arraybuffer" });

    fs.writeFileSync(filePath, response.data, (err) => {
        if (err) throw err;
        // console.log("Image downloaded successfully!");
    });
    return filePath;
}
