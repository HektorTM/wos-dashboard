function parseID(id) {
    return String(id)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');
}


module.exports = { parseID };