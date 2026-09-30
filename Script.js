document.addEventListener("DOMContentLoaded", () => {

    const imageInput = document.getElementById("imageInput");
    const uploadArea = document.getElementById("uploadArea");
    const previewContainer = document.getElementById("previewContainer");
    const imagePreview = document.getElementById("imagePreview");
    const extractButton = document.getElementById("extractButton");

    const progressContainer =
        document.getElementById("progressContainer");

    const progressText =
        document.getElementById("progressText");

    const progressBar =
        document.getElementById("progressBar");

    const resultContainer =
        document.getElementById("resultContainer");

    const resultText =
        document.getElementById("resultText");

    const copyButton =
        document.getElementById("copyButton");

    const downloadButton =
        document.getElementById("downloadButton");

    const clearButton =
        document.getElementById("clearButton");


    let selectedImage = null;


    /* =========================
       IMAGE SELECTION
    ========================= */

    imageInput.addEventListener("change", (event) => {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        handleImage(file);
    });


    function handleImage(file) {

        if (!file.type.startsWith("image/")) {

            alert("Please select a valid image file.");

            return;
        }


        selectedImage = file;

        const imageURL = URL.createObjectURL(file);

        imagePreview.src = imageURL;

        previewContainer.classList.remove("hidden");

        resultContainer.classList.add("hidden");

        progressContainer.classList.add("hidden");

        progressBar.style.width = "0%";

        progressText.textContent = "Preparing OCR...";
    }


    /* =========================
       DRAG AND DROP
    ========================= */

    uploadArea.addEventListener("dragover", (event) => {

        event.preventDefault();

        uploadArea.classList.add("dragover");
    });


    uploadArea.addEventListener("dragleave", () => {

        uploadArea.classList.remove("dragover");
    });


    uploadArea.addEventListener("drop", (event) => {

        event.preventDefault();

        uploadArea.classList.remove("dragover");

        const file = event.dataTransfer.files[0];

        if (!file) {
            return;
        }

        handleImage(file);
    });


    /* =========================
       OCR
    ========================= */

    extractButton.addEventListener("click", async () => {

        if (!selectedImage) {

            alert("Please upload an image first.");

            return;
        }


        if (typeof Tesseract === "undefined") {

            alert(
                "OCR library is still loading. Please wait a moment and try again."
            );

            return;
        }


        progressContainer.classList.remove("hidden");

        resultContainer.classList.add("hidden");

        extractButton.disabled = true;

        extractButton.textContent = "Extracting...";

        progressBar.style.width = "0%";

        progressText.textContent =
            "Starting OCR. This may take a moment...";


        try {

            const result = await Tesseract.recognize(
                selectedImage,
                "eng",
                {
                    logger: (message) => {

                        if (message.status) {

                            let status =
                                message.status
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, letter =>
                                        letter.toUpperCase()
                                    );

                            if (typeof message.progress === "number") {

                                const percentage =
                                    Math.round(
                                        message.progress * 100
                                    );

                                progressBar.style.width =
                                    percentage + "%";

                                progressText.textContent =
                                    `${status} – ${percentage}%`;

                            } else {

                                progressText.textContent =
                                    status;
                            }
                        }
                    }
                }
            );


            const extractedText =
                result.data.text.trim();


            progressBar.style.width = "100%";

            progressText.textContent =
                "Text extraction completed.";


            if (extractedText) {

                resultText.value = extractedText;

            } else {

                resultText.value =
                    "No readable text was detected in this image.";
            }


            resultContainer.classList.remove("hidden");

        } catch (error) {

            console.error("OCR Error:", error);

            progressText.textContent =
                "Something went wrong while processing the image.";

            alert(
                "Unable to extract text from this image. Please try another clearer image."
            );

        } finally {

            extractButton.disabled = false;

            extractButton.textContent =
                "Extract Text";
        }
    });


    /* =========================
       COPY TEXT
    ========================= */

    copyButton.addEventListener("click", async () => {

        const text = resultText.value.trim();

        if (!text) {

            alert("There is no text to copy.");

            return;
        }


        try {

            await navigator.clipboard.writeText(text);

            const originalText =
                copyButton.textContent;

            copyButton.textContent =
                "Copied!";

            setTimeout(() => {

                copyButton.textContent =
                    originalText;

            }, 1800);

        } catch (error) {

            resultText.select();

            document.execCommand("copy");

            alert("Text copied.");
        }
    });


    /* =========================
       DOWNLOAD TEXT
    ========================= */

    downloadButton.addEventListener("click", () => {

        const text = resultText.value.trim();

        if (!text) {

            alert("There is no text to download.");

            return;
        }


        const blob = new Blob(
            [text],
            {
                type: "text/plain;charset=utf-8"
            }
        );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "extracted-text.txt";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    });


    /* =========================
       CLEAR TOOL
    ========================= */

    clearButton.addEventListener("click", () => {

        selectedImage = null;

        imageInput.value = "";

        imagePreview.src = "";

        resultText.value = "";

        previewContainer.classList.add("hidden");

        resultContainer.classList.add("hidden");

        progressContainer.classList.add("hidden");

        progressBar.style.width = "0%";

        progressText.textContent =
            "Preparing OCR...";
    });

});
