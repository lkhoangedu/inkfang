#!/usr/bin/env python3
"""Create a portable distribution using an explicit, credential-free allowlist."""
import argparse
import hashlib
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('output', type=Path, help='Output directory, outside the source checkout')
args = parser.parse_args()
output = args.output.resolve()
if output == root or root in output.parents:
    parser.error('Choose an output folder outside the source checkout.')
output.mkdir(parents=True, exist_ok=True)

files = [root / 'README.md', root / 'DEPLOY.md']
for folder in ['dist', 'tests', 'examples', '.github/workflows', 'scripts']:
    files.extend(p for p in (root / folder).rglob('*') if p.is_file() and not p.is_symlink() and '__pycache__' not in p.parts)
files = sorted(set(files))
kit = output / 'inkfang-deployment-kit.zip'
with ZipFile(kit, 'w', ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, 'inkfang/' + path.relative_to(root).as_posix())

website = output / 'inkfang-website-files.zip'
with ZipFile(website, 'w', ZIP_DEFLATED) as archive:
    for path in sorted((root / 'dist').rglob('*')):
        if path.is_file() and not path.is_symlink():
            archive.write(path, path.relative_to(root / 'dist').as_posix())
    archive.writestr('.nojekyll', '')

checksums = []
for archive in [kit, website]:
    with ZipFile(archive) as z:
        assert z.testzip() is None
        assert not any('/.openai/' in n or '/.git/' in n or '__MACOSX' in n for n in z.namelist())
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    checksums.append(f'{digest}  {archive.name}')
    print(f'{archive.name}: {archive.stat().st_size:,} bytes')
(output / 'SHA256SUMS.txt').write_text('\n'.join(checksums) + '\n')
