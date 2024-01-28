document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(variables => {
            const form = document.getElementById('envEditor');

		variables.forEach(variable => {
			const formGroup = document.createElement('div');
			formGroup.className = 'form-group';

			const label = document.createElement('label');
			label.textContent = variable['Game setting'] + ' - ' + variable['Description'];
			label.htmlFor = variable['Variable'];
			formGroup.appendChild(label);

			let inputElement;

			if (variable['Allowed Value'] === 'Float' || variable['Allowed Value'] === 'Integer') {
                let step = 1;
                if(variable['Allowed Value'] === 'Float'){
                    step=0.01;
                }
                if(variable.hasOwnProperty('max')){
                    createInputWithSlider(variable,step);
                }else{
                    inputElement = document.createElement('input');
				    inputElement.type = 'number';
				    inputElement.className = 'form-control';
				    inputElement.value = variable['Default Value'];
				    inputElement.step = step; 
                }
				
			} else if (variable['Allowed Value'] === 'Enum') {
				inputElement = document.createElement('select');
				inputElement.className = 'form-control';
				const options = variable['Options'].split('\n');
				options.forEach(option => {
					const optionElement = document.createElement('option');
					optionElement.value = option.trim();
					optionElement.textContent = option.trim();
					inputElement.appendChild(optionElement);
				});
				// Set the default selected option
				inputElement.value = variable['Default Value'];
			} else {
				inputElement = document.createElement('input');
				inputElement.type = 'text';
				inputElement.className = 'form-control';
				inputElement.value = variable['Default Value'];
			}

			inputElement.id = variable['Variable'];
			inputElement.name = variable['Variable'];
			formGroup.appendChild(inputElement);
			form.appendChild(formGroup);
        });
    })
        .catch(error => {
            console.error('Error loading the JSON file:', error);
        });
});

function createInputWithSlider(variable, step) {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-group';

    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.className = 'form-control';
    numberInput.value = variable['Default Value'];
    numberInput.step = step;
    numberInput.id = variable['Variable'];
    numberInput.name = variable['Variable'];
    wrapper.appendChild(numberInput);

    if (variable.hasOwnProperty('max')) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'custom-range';
        slider.min = variable['Default Value'];
        slider.max = variable['max'];
        slider.value = variable['Default Value'];
        slider.step = step;
        wrapper.appendChild(slider);

        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.className = 'btn btn-secondary ml-2';
        resetButton.textContent = 'Reset';
        resetButton.onclick = () => {
            numberInput.value = variable['Default Value'];
            slider.value = variable['Default Value'];
        };
        wrapper.appendChild(resetButton);

        // Synchronize number input and slider
        numberInput.addEventListener('input', () => {
            slider.value = numberInput.value;
        });

        slider.addEventListener('input', () => {
            numberInput.value = slider.value;
        });
    }

    return wrapper;
}
	
function generateEnvFile() {
    let content = '';
    const form = document.getElementById('envEditor');
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
        content += `${key}=${value}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'variables.env';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function copyToClipboard() {
    let content = '';
    const form = document.getElementById('envEditor');
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
        content += `${key}=${value}\n`;
    }

    navigator.clipboard.writeText(content).then(() => {
        alert('Copié dans le presse-papiers!');
    }, (err) => {
        console.error('Erreur lors de la copie :', err);
    });
}

function populateForm() {
    const envContent = document.getElementById('envContent').value;
    const lines = envContent.split('\n');
    const form = document.getElementById('envEditor');

    lines.forEach(line => {
        const [key, value] = line.split('=');
        if (form.elements[key]) {
            form.elements[key].value = value;
        }
    });

    closeModal();
}

function openModal() {
    document.getElementById('envModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('envModal').style.display = 'none';
}