"""Export one neutral SVG per functional shape and preserve legacy presentation metadata."""
import copy, json, re, xml.etree.ElementTree as ET
from pathlib import Path
ET.register_namespace('', 'http://www.w3.org/2000/svg')
NS = '{http://www.w3.org/2000/svg}'
source = Path('src/components/icons/icon-source-data.json')
records = json.loads(source.read_text())
for item in records:
    if 'KursDetailExperience-' in item['path']: item['name'] = 'swap'
    if item['path'].endswith('/homepage.svg'): item['name'] = 'dashboard'
    if item['path'].endswith('/chevron-up.svg'): item['name'] = 'chevron-right'
source.write_text(json.dumps(records, indent=2) + '\n')
palette = json.loads('{}')
css = Path('src/app/globals.css').read_text()
for name, value in re.findall(r'--color-([\w-]+):\s*(#[\da-fA-F]+)\s*;', css):
    palette.setdefault(value.lower(), f'var(--color-{name})')
def paint(value):
    value = re.sub(r'var\(--fill-\d+,\s*([^)]*)\)', r'\1', value)
    if value == 'white': value = '#ffffff'
    if value.lower() == '#fff': value = '#ffffff'
    if value.lower() == '#000': value = '#000000'
    return palette.get(value.lower(), value)
def visible(root):
    result=[]
    def visit(node):
        if node.tag.split('}')[-1] in ('defs', 'mask', 'clipPath'): return
        result.append(node)
        for child in node: visit(child)
    visit(root)
    return result
aliases={}; shapes={}
for record in records:
    root=ET.fromstring(record['svg'])
    nodes=visible(root)
    colors=[]
    for node in nodes:
        for attr in ('fill','stroke'):
            value=node.get(attr)
            if value and value not in ('none','currentColor'):
                value=paint(value)
                if value not in colors: colors.append(value)
    aliases[record['path']]={'name':record['name'], 'color': colors[0] if colors else 'currentColor', 'width':float(root.get('viewBox','0 0 24 24').split()[2]), 'height':float(root.get('viewBox','0 0 24 24').split()[3])}
    if len(colors)>1: aliases[record['path']]['accent']=colors[1]
    if record['path'].endswith('/controls/chevron-down.svg') or '/TextField-' in record['path']: aliases[record['path']]['viewBox']='3.9 6.4 12.2 7.2'
    if record['name'] in shapes: continue
    name=record['name']
    # Definitions retain their white masks/clip paths; only visible paint is neutralized.
    secondary=[]
    for node in nodes:
        for attr in ('fill','stroke'):
            value=node.get(attr)
            if value and value != 'none':
                if len(colors)>1 and paint(value)==colors[1]:
                    secondary.append(copy.deepcopy(node)); node.set(attr,'var(--icon-accent, transparent)')
                else: node.set(attr,'currentColor')
    if secondary:
        # A transparent symbol must reveal the background, not paint over the disc/triangle.
        mask=ET.Element(NS+'mask', {'id':'icon-cutout','maskUnits':'userSpaceOnUse','x':root.get('viewBox').split()[0],'y':root.get('viewBox').split()[1],'width':root.get('viewBox').split()[2],'height':root.get('viewBox').split()[3]})
        ET.SubElement(mask, NS+'rect', {'x':root.get('viewBox').split()[0],'y':root.get('viewBox').split()[1],'width':root.get('viewBox').split()[2],'height':root.get('viewBox').split()[3],'fill':'white'})
        for node in secondary:
            for attr in ('fill','stroke'):
                if node.get(attr) and node.get(attr)!='none': node.set(attr,'black')
            mask.append(copy.deepcopy(node))
        defs=ET.Element(NS+'defs'); defs.append(mask)
        content=ET.Element(NS+'g', {'mask':'url(#icon-cutout)'})
        for child in list(root): root.remove(child); content.append(child)
        root.append(defs); root.append(content)
        for node in secondary:
            for attr in ('fill','stroke'):
                if node.get(attr) and node.get(attr)!='none': node.set(attr,'var(--icon-accent, transparent)')
            root.append(node)
    for node in root.iter():
        node.attrib.pop('style',None)
        if 'id' in node.attrib: node.set('id', name+'-'+node.get('id'))
        for key, val in list(node.attrib.items()):
            node.set(key,re.sub(r'url\(#([^)]*)\)', lambda m: f'url(#{name}-{m[1]})',val))
    for key in ('preserveAspectRatio','overflow'): root.attrib.pop(key,None)
    root.set('color','#26292c')
    root.set('width',root.get('viewBox').split()[2]); root.set('height',root.get('viewBox').split()[3])
    xml=ET.tostring(root,encoding='unicode')
    target=Path(f'public/assets/icons/{name}.svg'); target.parent.mkdir(parents=True,exist_ok=True); target.write_text(xml+'\n')
    attrs={re.sub(r'-([a-z])',lambda m:m[1].upper(),k):v for k,v in root.attrib.items() if k not in ('color','width','height')}
    body=''.join(ET.tostring(child,encoding='unicode') for child in root)
    body=re.sub(r' xmlns="[^"]+"','',body)
    shapes[name]={'attributes':attrs,'body':body,'width':float(root.get('width')),'height':float(root.get('height'))}
for unused in Path('public/assets/icons').glob('*.svg'):
    if unused.stem not in shapes: unused.unlink()
redirect_file=Path('src/components/asset-bank/asset-redirects.json')
redirects=json.loads(redirect_file.read_text())
redirects.update({old:f'/assets/icons/{data["name"]}.svg' for old,data in aliases.items()})
redirect_file.write_text(json.dumps(redirects,indent=2)+'\n')
Path('src/components/icons/icon-library.json').write_text(json.dumps({'shapes':shapes,'aliases':aliases},indent=2)+'\n')
print(f'Unified icons: {len(records)} variants -> {len(shapes)} shapes')
