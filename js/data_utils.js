const DataUtils = {
    parseSponsorsText: function(text) {
        const sponsors = [];

        if (!text) {
            return sponsors;
        }

        const lines = text.trim().split('\n');
        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length < 3) {
                return;
            }

            const name = parts[0].trim();
            const project = parts[1].trim();
            const amountStr = parts[2].trim().replace('￥', '');
            const amount = parseFloat(amountStr);
            const date = parts[3] ? parts[3].trim() : '';

            if (!isNaN(amount)) {
                sponsors.push({ name, project, amount, date });
            }
        });

        return sponsors;
    },

    buildSponsorTotals: function(sponsors) {
        const totals = {};

        sponsors.forEach(item => {
            if (!totals[item.name]) {
                totals[item.name] = 0;
            }
            totals[item.name] += item.amount;
        });

        return totals;
    }
};
