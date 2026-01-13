const https = require('https');
const fs = require('fs');
const path = require('path');

// Book data with titles for Google Books search
const books = [
    { id: 'sealed-nectar', title: 'The Sealed Nectar', author: 'Mubarakpuri' },
    { id: 'prince-persia', title: 'Making of Prince of Persia', author: 'Jordan Mechner' },
    { id: 'kunan-poshpora', title: 'Kunan Poshpora', author: 'Zubaan' },
    { id: 'enjoy-life', title: 'Enjoy Your Life', author: 'Muhammad Al-Arifi' },
    { id: 'gems-jewels', title: 'Gems and Jewels', author: 'Mujahid' },
    { id: 'code', title: 'Code Hidden Language', author: 'Charles Petzold' },
    { id: 'heavens-sale', title: 'When the Heavens Went on Sale', author: 'Ashlee Vance' },
    { id: 'elon-vance', title: 'Elon Musk', author: 'Ashlee Vance' },
    { id: 'elon-isaacson', title: 'Elon Musk', author: 'Walter Isaacson' },
    { id: 'steve-jobs', title: 'Steve Jobs', author: 'Walter Isaacson' },
    { id: 'einstein', title: 'Einstein His Life Universe', author: 'Walter Isaacson' },
    { id: 'zero-to-one', title: 'Zero to One', author: 'Peter Thiel' },
    { id: 'wings-of-fire', title: 'Wings of Fire', author: 'Abdul Kalam' },
    { id: 'worlds-i-see', title: 'The Worlds I See', author: 'Fei-Fei Li' },
    { id: 'stop-worrying', title: 'How to Stop Worrying', author: 'Dale Carnegie' },
    { id: 'hail-mary', title: 'Project Hail Mary', author: 'Andy Weir' },
    { id: 'guarding-tongue', title: 'Guarding the Tongue', author: 'Nawawi' },
    { id: 'user-friendly', title: 'User Friendly Hidden Rules Design', author: 'Cliff Kuang' },
    { id: 'design-everyday', title: 'Design of Everyday Things', author: 'Don Norman' },
    { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear' },
    { id: 'calvin-hobbes', title: 'Calvin and Hobbes', author: 'Bill Watterson' }
];

const outputDir = path.join(__dirname, '../public/images/books');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');
        protocol.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                httpGet(res.headers.location).then(resolve).catch(reject);
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ data, statusCode: res.statusCode }));
        }).on('error', reject);
    });
}

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        const protocol = url.startsWith('https') ? https : require('http');

        const request = protocol.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                downloadImage(response.headers.location, filename).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(filename);
                resolve(false);
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        });

        request.on('error', (err) => {
            file.close();
            if (fs.existsSync(filename)) fs.unlinkSync(filename);
            reject(err);
        });
    });
}

async function searchGoogleBooks(title, author) {
    const query = encodeURIComponent(`${title} ${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;

    try {
        const { data } = await httpGet(url);
        const json = JSON.parse(data);

        if (json.items && json.items.length > 0) {
            const imageLinks = json.items[0].volumeInfo?.imageLinks;
            if (imageLinks) {
                // Prefer larger images
                const imageUrl = imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.thumbnail;
                // Convert to HTTPS and get larger version
                return imageUrl?.replace('http://', 'https://').replace('zoom=1', 'zoom=2');
            }
        }
    } catch (err) {
        console.error(`  Search error: ${err.message}`);
    }
    return null;
}

async function fetchCovers() {
    console.log('Fetching book covers from Google Books API...\n');

    let downloaded = 0;
    let failed = 0;

    for (const book of books) {
        const filename = path.join(outputDir, `${book.id}.jpg`);

        // Skip if file already exists and is valid
        if (fs.existsSync(filename)) {
            const stats = fs.statSync(filename);
            if (stats.size > 5000) {
                console.log(`✓ ${book.id}.jpg (already exists)`);
                downloaded++;
                continue;
            }
        }

        process.stdout.write(`  Searching: ${book.title}...`);

        const imageUrl = await searchGoogleBooks(book.title, book.author);

        if (imageUrl) {
            try {
                const success = await downloadImage(imageUrl, filename);
                if (success) {
                    const stats = fs.statSync(filename);
                    if (stats.size > 2000) {
                        console.log(` ✓ downloaded (${Math.round(stats.size / 1024)}KB)`);
                        downloaded++;
                    } else {
                        fs.unlinkSync(filename);
                        console.log(' ✗ too small');
                        failed++;
                    }
                } else {
                    console.log(' ✗ download failed');
                    failed++;
                }
            } catch (err) {
                console.log(` ✗ error: ${err.message}`);
                failed++;
            }
        } else {
            console.log(' ✗ no cover found');
            failed++;
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\nDone! Downloaded: ${downloaded}, Failed: ${failed}`);
}

fetchCovers();
