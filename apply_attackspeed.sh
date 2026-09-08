#!/bin/bash
set -e

echo "==> [1/5] Fazendo backup de seguranca do src/player.h..."
cp src/player.h src/player.h.bak

echo "==> [2/5] Aplicando a formula linear de Attack Speed por Fist (1% por skill)..."
python3 -c '
import re

file_path = "src/player.h"
with open(file_path, "r") as f:
    code = f.read()

# Padrao que busca a funcao getAttackSpeed atual no player.h
pattern = r"uint32_t getAttackSpeed\(\) const\s*\{[\s\S]*?\n\t*\}"

new_func = """uint32_t getAttackSpeed() const {
\t\t\tuint32_t baseSpeed = vocation ? vocation->getAttackSpeed() : 2000;
\t\t\tif (baseSpeed == 0) {
\t\t\t\tbaseSpeed = 2000;
\t\t\t}

\t\t\t// Pega o nivel atual de Fist Fighting do jogador
\t\t\tuint32_t fistSkill = getSkillLevel(SKILL_FIST);

\t\t\t// Impede que o bonus passe de 90% (evita velocidade negativa ou bugs)
\t\t\tif (fistSkill > 90) {
\t\t\t\tfistSkill = 90; // Limitador de 90% para proteger a engine
\t\t\t}

\t\t\t// Aplica a formula: cada ponto de Fist reduz o intervalo em 1%
\t\t\tuint32_t finalSpeed = (baseSpeed * (100 - fistSkill)) / 100;

\t\t\t// Trava de seguranca: impede que a velocidade fique abaixo de 100ms
\t\t\tif (finalSpeed < 100) {
\t\t\t\treturn 100;
\t\t\t}

\t\t\treturn finalSpeed;
\t\t}"""

if re.search(pattern, code):
    code = re.sub(pattern, new_func, code, count=1)
    with open(file_path, "w") as f:
        f.write(code)
    print("-> Sucesso: src/player.h atualizado com precisao!")
else:
    print("-> Erro: Assinatura getAttackSpeed nao encontrada em src/player.h")
    exit(1)
'

echo "==> [3/5] Parando o servidor temporariamente..."
sudo systemctl stop otserv.service 2>/dev/null || true
killall -9 tfs 2>/dev/null || true
killall -9 yurots 2>/dev/null || true

echo "==> [4/5] Recompilando com CMake e Make..."
mkdir -p build
cd build
cmake ..
make -j$(nproc)

echo "==> [5/5] Atualizando o executavel e reiniciando o servico..."
cp tfs ../tfs 2>/dev/null || cp yurots ../yurots 2>/dev/null || true
chmod +x ../tfs 2>/dev/null || true
cd ..

sudo systemctl restart otserv.service 2>/dev/null || true

echo "======================================================="
echo "   RECOMPILACAO E ATUALIZACAO CONCLUIDAS COM SUCESSO!  "
echo "======================================================="
