
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const app = express();

app.use(cors());

const projectFolder = path.join(__dirname, "..");
const uploadFolder = path.join(__dirname, "uploads");

fs.mkdirSync(uploadFolder, { recursive: true });

// Your existing C++ program
const program = path.join(projectFolder, "HuffCompress.exe");

// Upload file
const upload = multer({
    dest: uploadFolder,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Download processed file

app.get("/download/:name", function(req, res) {

    const fileName = path.basename(req.params.name);
    const filePath = path.join(uploadFolder, fileName);

    const downloadName = req.query.filename || fileName;

    res.download(filePath, path.basename(downloadName));
});


// Compress file
app.post("/compress", upload.single("file"), function(req, res) {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please select a file"
        });
    }

    const input = req.file.path;
    const output = input + ".huff";
    const treeFile = input + ".json";

    execFile(program,
        ["compress", input, output, treeFile],
        { cwd: projectFolder },
        function(error, stdout, stderr) {

            if (error || !fs.existsSync(output)) {
                return res.status(500).json({
                    success: false,
                    message: stderr || stdout || "Compression failed"
                });
            }

            const originalSize = fs.statSync(input).size;
            const compressedSize = fs.statSync(output).size;

            const ratio = compressedSize / originalSize;
            const saved = (1 - ratio) * 100;

            let tree = null;

            if (fs.existsSync(treeFile)) {
                try {
                    tree = JSON.parse(
                        fs.readFileSync(treeFile, "utf8")
                    );
                } catch (e) {
                    console.log("Tree reading error");
                }
            }

            res.json({
                success: true,
                originalSize: originalSize,
                compressedSize: compressedSize,
                ratio: ratio.toFixed(2),
                saved: saved.toFixed(2) + "%",
                codes: stdout,
                tree: tree,
                downloadUrl: "/download/" + path.basename(output)
    + "?filename=" + encodeURIComponent(
        path.parse(req.file.originalname).name + ".huff"
    )
            });
        }
    );
});

// Decompress file
app.post("/decompress", upload.single("file"), function(req, res) {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please select a file"
        });
    }

    const input = req.file.path;
    const output = input + ".decoded";

    execFile(program,
        ["decompress", input, output],
        { cwd: projectFolder },
        function(error, stdout, stderr) {

            if (error || !fs.existsSync(output)) {
                return res.status(500).json({
                    success: false,
                    message: stderr || stdout || "Decompression failed"
                });
            }

            const originalSize = fs.statSync(input).size;
            const compressedSize = fs.statSync(output).size;

            res.json({
                success: true,
                originalSize: originalSize,
                compressedSize: compressedSize,
                ratio: "--",
                saved: "--",
                codes: "File decompressed successfully",
                tree: null,
                downloadUrl: "/download/" + path.basename(output) + "?filename=" + encodeURIComponent(  path.parse(req.file.originalname).name + "_decompressed.txt")
            });
        }
    );
});

app.listen(3000, function() {
    console.log("HuffCompress Backend running on http://localhost:3000");
});
