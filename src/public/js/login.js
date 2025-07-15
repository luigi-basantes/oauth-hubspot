document.getElementById("copyBtn").onclick = async () => {
    const text = document.getElementById("redirectURL").textContent;
    await navigator.clipboard.writeText(text);

    alert("Copied");
};
