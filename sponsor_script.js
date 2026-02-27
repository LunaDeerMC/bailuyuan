document.addEventListener('DOMContentLoaded', () => {
    fetchSponsorsData();
});

async function fetchSponsorsData() {
    try {
        const response = await fetch('sponsors.txt');
        if (!response.ok) {
            throw new Error('Failed to fetch sponsors.txt');
        }
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        const sponsors = [];
        const userTotals = {};
        let grandTotal = 0;

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const name = parts[0].trim();
                const project = parts[1].trim();
                const amountStr = parts[2].trim().replace('￥', '');
                const amount = parseFloat(amountStr);
                const date = parts[3] ? parts[3].trim() : '';

                if (!isNaN(amount)) {
                    sponsors.push({ name, project, amount, date });
                    grandTotal += amount; 

                    if (userTotals[name]) {
                        userTotals[name] += amount;
                    } else {
                        userTotals[name] = amount;
                    }
                }
            }
        });

        // Update Total
        const totalDisplay = document.getElementById('total-amount-display');
        if (totalDisplay) {
            totalDisplay.innerText = `累计获得赞助: ¥${grandTotal.toFixed(2)}`;
        }

        // Recent Donations Logic
        // Original list is chronological (oldest to newest), reverse it for newest first
        const recentSponsors = [...sponsors].reverse();
        renderDonationGrid(recentSponsors);

    } catch (error) {
        console.error('Error loading sponsors:', error);
        const grid = document.getElementById('donation-list');
        if(grid) grid.innerHTML = '<p>加载数据失败</p>';
    }
}

function renderDonationGrid(sponsors) {
    const container = document.getElementById('donation-list');
    if (!container) return;

    container.innerHTML = sponsors.map(s => `
        <div class="donation-card">
            <div class="donation-header">
                <span class="donor-name">${s.name}</span>
                <span class="donation-amount">¥${s.amount.toFixed(2)}</span>
            </div>
            <div class="donation-purpose">${s.project}</div>
            <div class="donation-date">${s.date}</div>
        </div>
    `).join('');
}
