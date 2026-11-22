
let fileInput = document.getElementById("fileInput");
let compressBtn = document.getElementById("compressBtn");
let decompressBtn = document.getElementById("decompressBtn");
let statusText = document.getElementById("status");
let downloadBtn = document.getElementById("downloadBtn");
let viewTreeBtn = document.getElementById("viewTreeBtn");

let treeData = null;

// File size ko KB ya MB mein show karna
function fileSize(bytes) {
    return bytes + " Bytes";
}
// Compress button
compressBtn.onclick = function () {
    alert("Compress button clicked!");
    processFile("compress");
};

// Decompress button
decompressBtn.onclick = function () {
    processFile("decompress");
};

// File processing
async function processFile(action) {
   
let resultHeading = document.getElementById("resultHeading");

let firstLabel = document.getElementById("firstLabel");
let secondLabel = document.getElementById("secondLabel");

let ratioRow = document.getElementById("ratioRow");
let savedRow = document.getElementById("savedRow");

let codesSection = document.getElementById("codesSection");
let treeSection = document.getElementById("treeSection");

if (action === "compress") {

    resultHeading.innerText = "Compression Result";

    firstLabel.innerText = "Original Size:";
    secondLabel.innerText = "Compressed Size:";

    ratioRow.style.display = "block";
    savedRow.style.display = "block";

    codesSection.style.display = "block";
    treeSection.style.display = "block";
}
else {

    resultHeading.innerText = "Decompression Result";

    firstLabel.innerText = "Compressed File Size:";
    secondLabel.innerText = "Restored File Size:";

    ratioRow.style.display = "none";
    savedRow.style.display = "none";

    codesSection.style.display = "none";
    treeSection.style.display = "none";
}

    let file = fileInput.files[0];

    if (!file) {
        alert("Please select a file first!");
        return;
    }
    

if (action === "compress") {

    let name = file.name.toLowerCase();

    let validText = name.endsWith(".txt") &&
                    !name.endsWith(".txt.txt");

    let validWord = name.endsWith(".docx") &&
                    !name.endsWith(".docx.docx");

    if (!validText && !validWord) {
        statusText.innerText =
            "Error: Please select a valid .txt or .docx file.";
        return;
    }
}


if (action === "decompress") {

    if (!file.name.toLowerCase().endsWith(".huff")) {
        statusText.innerText =
            "Error: Invalid compressed file! Please select a .huff file.";
        return;
    }
}


    statusText.innerText = "Processing your file...";

    compressBtn.disabled = true;
    decompressBtn.disabled = true;
    downloadBtn.hidden = true;
    treeData = null;
    document.getElementById("treeContainer").innerHTML = "";
    document.getElementById("huffmanCodes").innerText =
        "Waiting for results...";

    document.getElementById("originalSize").innerText = "--";
    document.getElementById("compressedSize").innerText = "--";
    document.getElementById("ratio").innerText = "--";
    document.getElementById("saved").innerText = "--";

    let formData = new FormData();
    formData.append("file", file);

    try {
        let response = await fetch(
            "http://localhost:3000/" + action,
            {
                method: "POST",
                body: formData
            }
        );

        let result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Processing failed");
        }

        statusText.innerText = "File processed successfully!";

        document.getElementById("originalSize").innerText =
            fileSize(result.originalSize);

        document.getElementById("compressedSize").innerText =
            fileSize(result.compressedSize);

        document.getElementById("ratio").innerText =
            result.ratio ?? "--";

        document.getElementById("saved").innerText =
            result.saved ?? "--";

        document.getElementById("huffmanCodes").innerText =
            result.codes || "No Huffman codes available";

        treeData = result.tree || null;

        if (result.downloadUrl) {
            downloadBtn.href =
                "http://localhost:3000" + result.downloadUrl;

            downloadBtn.hidden = false;
        }

    } catch (error) {
        statusText.innerText = "Error: " + error.message;
        document.getElementById("huffmanCodes").innerText =
            "No results available";
    }

    compressBtn.disabled = false;
    decompressBtn.disabled = false;
}



viewTreeBtn.onclick = function () {

    let container = document.getElementById("treeContainer");

    if (!treeData) {
        container.innerText =
            "Please compress a file first to view its Huffman tree.";
        return;
    }

    container.innerHTML = "";

    let controls = document.createElement("div");

    controls.innerHTML = `
        <button onclick="zoomIn()">+ Zoom In</button>
        <button onclick="zoomOut()">− Zoom Out</button>
        <button onclick="fitTree()">Fit to Screen</button>
        <button onclick="resetTree()">Reset</button>
    `;

    container.appendChild(controls);

    let treeArea = document.createElement("div");
    treeArea.id = "treeArea";
    treeArea.style.overflow = "auto";
    treeArea.style.height = "500px";
    treeArea.style.marginTop = "20px";

    container.appendChild(treeArea);

    drawTree();
};

let treeScale = 1;
let treeWidth = 1000;
let treeHeight = 600;

// Tree ki depth find karna
function getDepth(node) {
    if (!node) {
        return 0;
    }

    if (node.isLeaf) {
        return 1;
    }

    return 1 + Math.max(
        getDepth(node.left),
        getDepth(node.right)
    );
}

// Leaf nodes count karna
function countLeaves(node) {
    if (!node) {
        return 0;
    }

    if (node.isLeaf) {
        return 1;
    }

    return countLeaves(node.left) + countLeaves(node.right);
}

// Character ka readable name
function getCharacter(code) {
    if (code === 10) return "LF";
    if (code === 13) return "CR";
    if (code === 32) return "Space";
    if (code === 9) return "Tab";

    if (code >= 33 && code <= 126) {
        return String.fromCharCode(code);
    }

    return "Byte " + code;
}

// Tree draw karna
function drawTree() {

    let treeArea = document.getElementById("treeArea");

    if (!treeArea || !treeData) {
        return;
    }

    let root = treeData.tree;

    if (!root) {
        treeArea.innerText = "Tree data not available.";
        return;
    }

    let leaves = countLeaves(root);
    let depth = getDepth(root);

    treeWidth = Math.max(1000, leaves * 85);
    treeHeight = Math.max(500, depth * 110);

    treeArea.innerHTML = "";

    let svg = document.createElementNS(
        "http://www.w3.org/2000/svg", "svg"
    );

    svg.setAttribute("width", treeWidth * treeScale);
    svg.setAttribute("height", treeHeight * treeScale);
    svg.setAttribute("viewBox",
        "0 0 " + treeWidth + " " + treeHeight
    );

    treeArea.appendChild(svg);

    let leafNumber = 0;

    // Har node ko position dena
    function setPosition(node, level) {

        if (!node) {
            return 0;
        }

        let x;

        if (node.isLeaf) {
            x = 50 + leafNumber * 85;
            leafNumber++;
        } else {
            let leftX = setPosition(node.left, level + 1);
            let rightX = setPosition(node.right, level + 1);
            x = (leftX + rightX) / 2;
        }

        node.x = x;
        node.y = 50 + level * 110;

        return x;
    }

    setPosition(root, 0);

    // SVG element banane ka function
    function createSVG(name) {
        return document.createElementNS(
            "http://www.w3.org/2000/svg", name
        );
    }

    // Branches draw karna
    function drawLines(node) {

        if (!node || node.isLeaf) {
            return;
        }

        let children = [
            { child: node.left, bit: "0" },
            { child: node.right, bit: "1" }
        ];

        for (let item of children) {

            if (!item.child) {
                continue;
            }

            let line = createSVG("line");

            line.setAttribute("x1", node.x);
            line.setAttribute("y1", node.y);
            line.setAttribute("x2", item.child.x);
            line.setAttribute("y2", item.child.y);
            line.setAttribute("stroke", "#a5b4fc");
            line.setAttribute("stroke-width", "2");

            svg.appendChild(line);

            let label = createSVG("text");

            label.setAttribute("x",
                (node.x + item.child.x) / 2
            );

            label.setAttribute("y",
                (node.y + item.child.y) / 2 - 8
            );

            label.setAttribute("fill", "#ffffff");
            label.setAttribute("font-size", "15");
            label.setAttribute("text-anchor", "middle");

            label.textContent = item.bit;

            svg.appendChild(label);

            drawLines(item.child);
        }
    }

    // Nodes draw karna
    function drawNodes(node) {

        if (!node) {
            return;
        }

        let circle = createSVG("circle");

        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        circle.setAttribute("r", "28");

        circle.setAttribute("fill",
            node.isLeaf ? "#16a34a" : "#4f46e5"
        );

        circle.setAttribute("stroke", "#ffffff");
        circle.setAttribute("stroke-width", "1.5");

        svg.appendChild(circle);

        let text = createSVG("text");

        text.setAttribute("x", node.x);
        text.setAttribute("y", node.y + 5);
        text.setAttribute("fill", "#ffffff");
        text.setAttribute("font-size", "12");
        text.setAttribute("text-anchor", "middle");

        if (node.isLeaf) {
            text.textContent =
                getCharacter(node.characterCode);
        } else {
            text.textContent = node.frequency;
        }

        svg.appendChild(text);

        if (!node.isLeaf) {
            drawNodes(node.left);
            drawNodes(node.right);
        }
    }

    drawLines(root);
    drawNodes(root);
}

// Zoom In
function zoomIn() {
    treeScale = Math.min(treeScale * 1.25, 4);
    drawTree();
}

// Zoom Out
function zoomOut() {
    treeScale = Math.max(treeScale / 1.25, 0.05);
    drawTree();
}

// Fit entire tree inside available area
function fitTree() {

    let area = document.getElementById("treeArea");

    if (!area) {
        return;
    }

    treeScale = Math.min(
        area.clientWidth / treeWidth,
        area.clientHeight / treeHeight
    );

    drawTree();
}

// Reset tree to original scale
function resetTree() {
    treeScale = 1;
    drawTree();
}

