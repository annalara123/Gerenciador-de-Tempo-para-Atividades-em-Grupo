const participantForm = document.getElementById('participant-form');
const participantList = document.getElementById('participant-list');
const sessionHistory = document.getElementById('session-history');

const API_URL = 'http://localhost:3000/sessions';

let participants = [];

participantForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const time = parseInt(document.getElementById('time').value);

    const participant = { name, time, remainingTime: time * 60 }; 
    participants.push(participant);

    renderParticipants();
    participantForm.reset();
});

function renderParticipants() {
    participantList.innerHTML = '';
    participants.forEach((participant, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <span>${participant.name} - ${participant.time} minutos</span>
            <button class="btn btn-success" onclick="startTimer(${index})">Iniciar</button>
        `;
        participantList.appendChild(li);
    });
}

function startTimer(index) {
    const participant = participants[index];
    const intervalId = setInterval(() => {
        if (participant.remainingTime > 0) {
            participant.remainingTime--;
            const minutes = Math.floor(participant.remainingTime / 60);
            const seconds = participant.remainingTime % 60;
            participantList.children[index].innerHTML = `
                <span>${participant.name} - ${minutes}:${seconds < 10 ? '0' : ''}${seconds}</span>
                <button class="btn btn-danger" onclick="stopTimer(${intervalId})">Parar</button>
            `;
        } else {
            clearInterval(intervalId);
            alert(`${participant.name} terminou o tempo!`);
            saveSession(participant);
            participants.splice(index, 1);
            renderParticipants();
        }
    }, 1000);
}

function stopTimer(intervalId) {
    clearInterval(intervalId);
}

function saveSession(participant) {
    const session = {
        participant: participant.name,
        timeUsed: participant.time - Math.floor(participant.remainingTime / 60)
    };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(session)
    })
    .then(response => response.json())
    .then(data => loadSessions());
}

function loadSessions() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            sessionHistory.innerHTML = '';
            data.forEach(session => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `${session.participant} usou ${session.timeUsed} minutos`;
                sessionHistory.appendChild(li);
            });
        });
}
loadSessions();