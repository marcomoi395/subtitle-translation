const form = document.querySelector('form');
const messageParagraph = document.getElementById('message');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const source = document.querySelector('input[name="source"]').value;
        const destination = document.querySelector('input[name="destination"]').value;

        // Tạo đối tượng chứa dữ liệu
        const formData = {
            source, destination
        };

        // Gửi dữ liệu tới server qua POST request
        fetch("/process", {
            method: "POST", headers: {
                "Content-Type": "application/json"
            }, body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                messageParagraph.textContent = "Successfully processed";
            })
            .catch((error) => {
                messageParagraph.textContent = `Error: ${error}`;
            });
    })
}