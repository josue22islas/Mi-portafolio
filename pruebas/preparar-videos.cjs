// Relocate MP4 metadata without changing any encoded audio/video sample.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../assets/videos');
function atoms(buffer, start = 0, end = buffer.length) {
  const result = [];
  while (start < end) {
    const size = buffer.readUInt32BE(start);
    if (size < 8 || start + size > end) throw Error('Unsupported MP4 atom');
    result.push({ start, size, type: buffer.toString('ascii', start + 4, start + 8) });
    start += size;
  }
  return result;
}
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
for (const name of ['portfolio-background', 'hero-black-hole-overlay']) {
  const source = fs.readFileSync(path.join(root, name + '.mp4'));
  const top = atoms(source), moov = top.find(a => a.type === 'moov'), mdat = top.find(a => a.type === 'mdat');
  if (!moov || !mdat || moov.start < mdat.start) throw Error('Unexpected atom ordering');
  const metadata = Buffer.from(source.subarray(moov.start, moov.start + moov.size));
  function patch(start, end) {
    for (const atom of atoms(metadata, start, end)) {
      if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(atom.type)) patch(atom.start + 8, atom.start + atom.size);
      if (atom.type === 'co64') throw Error('64-bit offsets are not supported by this utility');
      if (atom.type === 'stco') {
        const count = metadata.readUInt32BE(atom.start + 12);
        if (16 + count * 4 !== atom.size) throw Error('Invalid chunk offset table');
        for (let i = 0; i < count; i++) {
          const at = atom.start + 16 + i * 4, old = metadata.readUInt32BE(at);
          if (old < mdat.start + 8 || old >= mdat.start + mdat.size) throw Error('Unexpected media offset');
          metadata.writeUInt32BE(old + moov.size, at);
        }
      }
    }
  }
  patch(0, metadata.length);
  const result = Buffer.concat([source.subarray(0, mdat.start), metadata, source.subarray(mdat.start, moov.start), source.subarray(moov.start + moov.size)]);
  const updatedMdat = atoms(result).find(a => a.type === 'mdat');
  if (hash(source.subarray(mdat.start + 8, mdat.start + mdat.size)) !== hash(result.subarray(updatedMdat.start + 8, updatedMdat.start + updatedMdat.size))) throw Error('Media changed');
  fs.writeFileSync(path.join(root, name + '-faststart.mp4'), result);
  console.log(name, 'encoded media unchanged; metadata now precedes media');
}
