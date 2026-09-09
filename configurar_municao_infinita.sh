#!/bin/bash
set -e

echo "=================================================================="
echo "🏹 CONFIGURANDO MUNIÇÕES INFINITAS NO OTSRV (MARLEYOT)"
echo "=================================================================="

# 1. Identificar o diretório do OTServ
if [ -d "yurOTS-server-master" ]; then
    SERVER_DIR="yurOTS-server-master"
elif [ -d "." ]; then
    SERVER_DIR="."
else
    SERVER_DIR="."
fi

cd "$SERVER_DIR"
echo "-> Diretório do servidor: $(pwd)"

# 2. Adicionar infiniteAmmo no config.lua
echo "-> [1/4] Atualizando config.lua com infiniteAmmo = true..."
python3 - << 'PYEOF'
with open("config.lua", "r") as f:
    content = f.read()

if "infiniteAmmo" not in content:
    content += "\n-- Infinite Ammo Settings\ninfiniteAmmo = true\n"
    with open("config.lua", "w") as f:
        f.write(content)
    print("   [+] infiniteAmmo adicionado ao config.lua!")
else:
    print("   [i] infiniteAmmo já estava presente no config.lua.")
PYEOF

# 3. Atualizar configmanager.h e configmanager.cpp para suportar INFINITE_AMMO
echo "-> [2/4] Atualizando ConfigManager (h/cpp)..."
python3 - << 'PYEOF'
# configmanager.h
with open("src/configmanager.h", "r") as f:
    h_content = f.read()

if "INFINITE_AMMO" not in h_content:
    h_content = h_content.replace("LAST_BOOLEAN_CONFIG", "INFINITE_AMMO,\n\t\t\tLAST_BOOLEAN_CONFIG")
    with open("src/configmanager.h", "w") as f:
        f.write(h_content)
    print("   [+] INFINITE_AMMO adicionado em configmanager.h")

# configmanager.cpp
with open("src/configmanager.cpp", "r") as f:
    cpp_content = f.read()

if "infiniteAmmo" not in cpp_content:
    cpp_content = cpp_content.replace('boolean[SHOW_MONSTER_LOOT] = getGlobalBoolean(L, "showMonsterLoot", true);', 'boolean[INFINITE_AMMO] = getGlobalBoolean(L, "infiniteAmmo", true);\n\tboolean[SHOW_MONSTER_LOOT] = getGlobalBoolean(L, "showMonsterLoot", true);')
    with open("src/configmanager.cpp", "w") as f:
        f.write(cpp_content)
    print("   [+] Configuração de leitura de infiniteAmmo adicionada em configmanager.cpp")
PYEOF

# 4. Atualizar combat.cpp para respeitar infiniteAmmo
echo "-> [3/4] Atualizando lógica em combat.cpp..."
python3 - << 'PYEOF'
with open("src/combat.cpp", "r") as f:
    combat = f.read()

target_throwable = """			if (weapon->getFragility()) {
				if (normal_random(0, 99) <= weapon->getFragility()) {"""

replacement_throwable = """			if (weapon->getFragility()) {
				if (!g_config.getBoolean(ConfigManager::INFINITE_AMMO) && normal_random(0, 99) <= weapon->getFragility()) {"""

target_ammo = """			if (normal_random(0, 100) <= ammunition->getFragility()) {"""
replacement_ammo = """			if (!g_config.getBoolean(ConfigManager::INFINITE_AMMO) && normal_random(0, 100) <= ammunition->getFragility()) {"""

modified = False
if target_throwable in combat and "INFINITE_AMMO" not in combat:
    combat = combat.replace(target_throwable, replacement_throwable)
    modified = True

if target_ammo in combat and "!g_config.getBoolean(ConfigManager::INFINITE_AMMO)" not in combat:
    combat = combat.replace(target_ammo, replacement_ammo)
    modified = True

if modified:
    with open("src/combat.cpp", "w") as f:
        f.write(combat)
    print("   [+] Lógica de munição infinita aplicada em combat.cpp com sucesso!")
else:
    print("   [i] Lógica de munição infinita já estava aplicada ou blocos não encontrados.")
PYEOF

echo "-> [4/4] Configuração concluída com sucesso no repositório!"
echo "=================================================================="
echo "✅ MUNIÇÕES INFINITAS PRONTAS PARA SEREM ENVIADAS PARA A VPS!"
echo "=================================================================="
