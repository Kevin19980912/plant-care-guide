#!/usr/bin/env python
import re

# 读取文件
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找 plants 数组
match = re.search(r'const plants=\[(.*?)\];', content, re.DOTALL)
if not match:
    print('ERROR: 找不到 plants 数组')
    exit(1)

plants_text = match.group(1)
print(f'找到 plants 数组，长度: {len(plants_text)} 字符')

# 分割每个植物条目
entries = []
depth = 0
current = ''
for ch in plants_text:
    current += ch
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            entry = current.strip().rstrip(',')
            if entry:
                entries.append(entry)
            current = ''

print(f'解析出 {len(entries)} 个植物')

# 提取 ID 的函数
def get_id(entry):
    m = re.search(r'\{id:(\d+)', entry)
    return int(m.group(1)) if m else 9999

# 按 ID 排序
entries.sort(key=get_id)

# 重建内容
new_content = content[:match.start(1)] + '\n' + ',\n'.join(entries) + '\n' + content[match.end(1):]

# 写入文件
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('排序完成!')
print('前5个:', [get_id(e) for e in entries[:5]])
print('后5个:', [get_id(e) for e in entries[-5:]])
