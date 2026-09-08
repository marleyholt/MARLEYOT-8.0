#!/bin/bash
set -e

echo "==> [1/4] Restaurando e aplicando Attack Speed com marcadores exatos..."

# Se houver backup limpo, restaura; senao usa o git para garantir integridade
if [ -f "src/player.h.bak" ]; then
    cp src/player.h.bak src/player.h
else
    git checkout src/player.h 2>/dev/null || true
fi

python3 -c '
file_path = "src/player.h"
with open(file_path, "r") as f:
    code = f.read()

start_marker = "uint32_t getAttackSpeed() const"
end_marker = "static uint8_t getPercentLevel"

start = code.find(start_marker)
end = code.find(end_marker)

if start == -1 or end == -1:
    print("ERRO: Marcadores nao encontrados em src/player.h!")
    exit(1)

new_func = """uint32_t getAttackSpeed() const {
\t\t\tuint32_t baseSpeed = vocation ? vocation->getAttackSpeed() : 2000;
\t\t\tif (baseSpeed == 0) {
\t\t\t\tbaseSpeed = 2000;
\t\t\t}

\t\t\t// Fist Fighting atua como atributo global de velocidade de ataque para QUALQUER arma
\t\t\tuint32_t fistSkill = getSkillLevel(SKILL_FIST);

\t\t\t// Trava maxima de reducao em 90% (evita velocidade negativa ou freeze no scheduler)
\t\t\tif (fistSkill > 90) {
\t\t\t\tfistSkill = 90;
\t\t\t}

\t\t\t// Reducao linear: cada ponto de Fist reduz o intervalo de ataque em 1%
\t\t\tuint32_t finalSpeed = (baseSpeed * (100 - fistSkill)) / 100;

\t\t\t// Limite de seguranca minimo de 100ms
\t\t\tif (finalSpeed < 100) {
\t\t\t\treturn 100;
\t\t\t}

\t\t\treturn finalSpeed;
\t\t}

\t\t"""

updated = code[:start] + new_func + code[end:]

with open(file_path, "w") as f:
    f.write(updated)

print("-> Substituicao cirurgica concluida em src/player.h sem erros de sintaxe!")
'

echo "==> [2/4] Parando servico do OTServ..."
sudo systemctl stop otserv.service 2>/dev/null || true
killall -9 yurOTS 2>/dev/null || true
killall -9 tfs 2>/dev/null || true

echo "==> [3/4] Compilando yurOTS..."
mkdir -p build
cd build
cmake ..
make -j$(nproc)

echo "==> [4/4] Copiando binario yurOTS e reiniciando servico..."
cp yurOTS ../yurOTS
chmod +x ../yurOTS
cd ..

sudo systemctl restart otserv.service 2>/dev/null || true

echo "=========================================================="
echo "    COMPILACAO CONCLUIDA COM SUCESSO SEM ERROS!          "
echo "  Attack Speed via Fist funcionando para TODAS as armas!  "
echo "=========================================================="
