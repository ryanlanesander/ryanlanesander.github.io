document.addEventListener('DOMContentLoaded', function() {
    fetch('calendar_data.json')
        .then(response => response.json())
        .then(data => {
            const calendarDiv = document.getElementById('calendar');
            Object.entries(data).forEach(([month, events]) => {
                const monthDiv = document.createElement('div');
                monthDiv.className = `month ${month.toLowerCase()}`;
                
                const monthTitle = document.createElement('h2');
                monthTitle.textContent = `${events.emoji} ${month}`;
                monthDiv.appendChild(monthTitle);
                
                const eventsList = document.createElement('ul');
                events.items.forEach(event => {
                    const li = document.createElement('li');
                    li.innerHTML = event;
                    eventsList.appendChild(li);
                });
                
                monthDiv.appendChild(eventsList);
                calendarDiv.appendChild(monthDiv);
            });
        })
        .catch(error => console.error('Error loading calendar data:', error));
});
