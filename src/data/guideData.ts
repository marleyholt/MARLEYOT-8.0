import { GuideStep } from '../types';

export const ORACLE_GUIDE_STEPS: GuideStep[] = [
  {
    id: 'step-1-account',
    title: '1. Criar Conta na Oracle Cloud Always Free',
    shortDesc: 'Cadastrar no nível gratuito vitalício da Oracle e escolher a região correta.',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    content: {
      summary: 'A Oracle Cloud oferece instâncias gratuitas para sempre (Always Free), incluindo processadores ARM Ampere com até 4 OCPUs e 24 GB de memória RAM, além de instâncias AMD x86 de 1 GB. Isso é mais que suficiente para rodar um servidor Yurots 8.0 para mais de 300 jogadores simultâneos sem pagar nada!',
      instructions: [
        'Acesse https://www.oracle.com/cloud/free/ e clique em "Start for free".',
        'Preencha seus dados reais (Nome, País: Brazil, E-mail). Escolha sua Home Region (ex: Brazil East - São Paulo ou US East - Ashburn). Atenção: a Home Region NÃO pode ser alterada depois.',
        'Insira um cartão de crédito internacional para validação cadastral (a Oracle fará uma cobrança temporária de ~$1 USD para verificar o cartão e estornará em minutos; nenhum valor recorrente é cobrado no plano Always Free).',
        'Conclua a verificação por SMS ou e-mail e aguarde o e-mail de ativação da sua conta da Oracle.',
      ],
      tips: [
        'Dica: A região "Brazil East (São Paulo)" garante o menor ping (15ms a 40ms para jogadores brasileiros).',
        'Se a região de São Paulo acusar "Out of host capacity" no ARM Ampere, use a máquina AMD E2.1.Micro que tem disponibilidade ilimitada e suporta perfeitamente de 10 a 30 jogadores simultâneos.',
      ],
    },
  },
  {
    id: 'step-2-vm',
    title: '2. Criar a Instância (VM Ubuntu 22.04)',
    shortDesc: 'Configurar a máquina virtual na nuvem e baixar a chave SSH de acesso.',
    difficulty: 'Fácil',
    estimatedMinutes: 8,
    content: {
      summary: 'Aqui vamos criar a máquina virtual Always Free. A Oracle disponibiliza duas opções gratuitas: a poderosa Ampere ARM (até 4 OCPUs e 24GB RAM) e a estável AMD Micro (VM.Standard.E2.1.Micro com 1 OCPU e 1GB RAM). Ambas rodam o YurOTS 8.0!',
      instructions: [
        'No painel da Oracle Cloud, clique no menu superior esquerdo (três barras) -> "Compute" (Computação) -> "Instances" (Instâncias).',
        'Clique no botão azul "Create Instance" (Criar Instância).',
        'Nome: Dê o nome de "yurots-80-server".',
        'Image and Shape (Imagem e Forma): Clique em "Edit". Em Imagem, escolha "Canonical Ubuntu 22.04 LTS".',
        'Shape: Se escolher Ampere ARM (VM.Standard.A1.Flex), configure 2 OCPUs e 8GB ou 12GB de RAM. Se der erro de "Out of host capacity", selecione a "Specialty and Legacy -> VM.Standard.E2.1.Micro (AMD)" que sempre tem estoque!',
        'Networking: Deixe selecionada a VCN padrão e certifique-se de marcar "Assign a public IPv4 address" (Atribuir endereço IPv4 público).',
        'Add SSH keys (Chaves SSH): Selecione "Generate a key pair for me" e clique em "Save Private Key" (Baixar Chave Privada .key/.pem). GUARDE ESSE ARQUIVO COM A SUA VIDA!',
        'Clique em "Create" no rodapé e aguarde o status mudar de amarelo (PROVISIONING) para verde (RUNNING).',
        'Anote o "Public IP Address" (ex: 129.146.x.x) exibido na tela da instância.',
      ],
      tips: [
        'Como furar o erro "Out of host capacity" da Ampere: 1) Tente alocar 2 OCPUs e 8GB em vez do máximo de 4 OCPUs; 2) Teste em horários de menor movimento (02h às 07h da manhã); 3) Alterne o Availability Domain (AD-1, AD-2 ou AD-3).',
        'A VM.Standard.E2.1.Micro aguenta 10 a 30 jogadores com mapa Yurots (gasta apenas ~300MB de RAM). O único segredo é adicionar 3GB de Swap antes de compilar o C++ (explicado no Passo 6)!',
      ],
    },
  },
  {
    id: 'step-3-firewall-cloud',
    title: '3. Liberar as Portas no Firewall da Nuvem (VCN)',
    shortDesc: 'Permitir que os jogadores se conectem nas portas 7171, 7172 e o site na porta 80.',
    difficulty: 'Importante',
    estimatedMinutes: 5,
    content: {
      summary: 'A Oracle Cloud possui um firewall externo de rede (Virtual Cloud Network - Security List). Se você não abrir as portas aqui, ninguém de fora conseguirá conectar, mesmo se o servidor estiver ligado!',
      instructions: [
        'Na página da sua instância, role até "Instance Details" e clique no link da sua "Virtual Cloud Network (VCN)".',
        'Na página da VCN, clique em "Security Lists" no menu lateral esquerdo e clique em "Default Security List for vcn-...".',
        'Clique no botão azul "Add Ingress Rules" (Adicionar Regras de Entrada).',
        'Adicione as portas do Tibia e Web:',
        '  - Source CIDR: 0.0.0.0/0',
        '  - IP Protocol: TCP',
        '  - Destination Port Range: 7171,7172,80,443,3000',
        '  - Description: Portas OTServ 8.0 e Web',
        'Clique em "Add Ingress Rules". Agora a nuvem da Oracle autoriza o tráfego nas portas 7171 e 7172!',
      ],
      tips: [
        '7171 = Porta de Login do Tibia (Account Maker e Lista de Personagens)',
        '7172 = Porta de Jogo (Game World onde os personagens andam e batalham)',
        '80 e 3000 = Portas para o Website do Servidor',
      ],
      warning: 'Nunca feche a porta 22 (SSH), caso contrário você perderá o acesso remoto ao servidor!',
    },
  },
  {
    id: 'step-4-ssh-iptables',
    title: '4. Acessar o Servidor via SSH e Liberar o iptables',
    shortDesc: 'Conectar pelo terminal (PuTTY ou CMD) e desbloquear o firewall interno do Linux.',
    difficulty: 'Intermediário',
    estimatedMinutes: 7,
    content: {
      summary: 'O Ubuntu na Oracle Cloud vem por padrão com regras rígidas de iptables que bloqueiam conexões externas. Vamos conectar e liberar o sistema.',
      instructions: [
        'Abra o Terminal do seu computador (Windows PowerShell, CMD ou PuTTY) na pasta onde salvou sua chave privada .key.',
        'Conecte com o comando SSH:',
      ],
      commands: [
        {
          label: 'Ajustar permissão da chave (Linux/Mac) ou conectar (Windows)',
          cmd: 'ssh -i "oracle.key" ubuntu@SEU_IP_PUBLICO_ORACLE',
          desc: 'Substitua "oracle.key" pelo caminho da sua chave e SEU_IP_PUBLICO_ORACLE pelo IP da instância.',
        },
        {
          label: 'Atualizar os pacotes do Ubuntu',
          cmd: 'sudo apt update && sudo apt upgrade -y',
          desc: 'Garante que todos os patches de segurança do Linux estejam em dia.',
        },
        {
          label: 'Liberar as portas no iptables do Ubuntu (ESSENCIAL na Oracle)',
          cmd: 'sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7171 -j ACCEPT\nsudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7172 -j ACCEPT\nsudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT\nsudo netfilter-persistent save',
          desc: 'Salva as regras para que as portas continuem abertas mesmo se reiniciar a máquina.',
        },
      ],
      tips: [
        'Se o netfilter-persistent não estiver instalado, instale com: sudo apt install -y iptables-persistent netfilter-persistent',
      ],
    },
  },
  {
    id: 'step-5-mysql',
    title: '5. Instalar e Configurar o Banco de Dados (MariaDB)',
    shortDesc: 'Instalar o MariaDB Server, criar o banco yurots_80 e importar o schema oficial.',
    difficulty: 'Intermediário',
    estimatedMinutes: 8,
    content: {
      summary: 'O The Forgotten Server 1.2 utiliza banco de dados relacional MySQL/MariaDB para salvar contas, personagens, inventários, casas e mortes com altíssimo desempenho.',
      instructions: [
        'Instale o MariaDB Server rodando o comando no terminal SSH:',
      ],
      commands: [
        {
          label: 'Instalar o servidor MariaDB',
          cmd: 'sudo apt install -y mariadb-server mariadb-client',
        },
        {
          label: 'Acessar o console MySQL como root',
          cmd: 'sudo mysql',
        },
        {
          label: 'Criar o banco de dados e usuário do servidor',
          cmd: `CREATE DATABASE yurots_80 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'otserv'@'localhost' IDENTIFIED BY 'yurots_senha_forte_2026';
GRANT ALL PRIVILEGES ON yurots_80.* TO 'otserv'@'localhost';
FLUSH PRIVILEGES;
EXIT;`,
          desc: 'Substitua "yurots_senha_forte_2026" pela senha que preferir.',
        },
      ],
      tips: [
        'Você pode baixar o arquivo schema.sql gerado aqui no site ou usar o gerador automático na aba "Painel do GOD".',
      ],
    },
  },
  {
    id: 'step-6-compilation',
    title: '6. Compilar o MARLEYOT 7.72 (yurOTS)',
    shortDesc: 'Instalar as bibliotecas C++, compilar com CMake e gerar o executável do servidor.',
    difficulty: 'Intermediário',
    estimatedMinutes: 10,
    content: {
      summary: 'O servidor MARLEYOT 7.72 utiliza a engine robusta The Forgotten Server (TFS) adaptada para o protocolo 7.72 com física oldschool clássica, mapa nostálgico YurOTS, sistema de Fast Attack proporcional ao Fist Fighting e gemas de atributos especiais.',
      instructions: [
        'SE ESTIVER USANDO A VM.Standard.E2.1.Micro (1GB RAM): crie 3GB de Swap antes de compilar para evitar o erro "Killed signal terminated program cc1plus":',
        'Acesse seu terminal SSH e instale os pacotes de compilação essenciais para o TFS:',
        'Acesse a pasta do seu servidor ~/otserv:',
        'Navegue até a pasta build e compile usando todos os núcleos da CPU:',
        'Mova ou confirme o executável compilado "yurOTS" / "tfs" para a raiz da pasta do servidor:',
      ],
      commands: [
        {
          label: 'Ativar Swap de 3GB (Obrigatório se usar VM.Standard.E2.1.Micro de 1GB)',
          cmd: 'sudo fallocate -l 3G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=3072\nsudo chmod 600 /swapfile\nsudo mkswap /swapfile\nsudo swapon /swapfile\necho "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab',
          desc: 'Dá à máquina 1GB RAM + 3GB de memória virtual em SSD. Essencial para compilar o C++ sem travar!',
        },
        {
          label: 'Instalar dependências de compilação (Ubuntu 22.04 LTS)',
          cmd: 'sudo apt install -y git cmake build-essential liblua5.2-dev libluajit-5.1-dev default-libmysqlclient-dev libboost-system-dev libboost-date-time-dev libboost-filesystem-dev libboost-iostreams-dev libpugixml-dev libcrypto++-dev libfmt-dev',
          desc: 'Instala o compilador GCC/G++, CMake e todas as bibliotecas necessárias para o TFS.',
        },
        {
          label: 'Acessar a pasta do código e preparar compilação',
          cmd: 'cd ~/otserv && mkdir -p build && cd build\ncmake ..',
          desc: 'Gera as diretivas de compilação do CMake no ambiente Linux.',
        },
        {
          label: 'Compilar com CMake e múltiplos núcleos',
          cmd: 'make -j$(nproc)',
          desc: 'O processo leva de 3 a 7 minutos. O parâmetro -j$(nproc) usa todos os núcleos da CPU da Oracle.',
        },
        {
          label: 'Mover o binário compilado para a pasta principal e reiniciar serviço',
          cmd: 'cp -f ~/otserv/build/yurOTS ~/otserv/yurOTS 2>/dev/null || cp -f ~/otserv/build/tfs ~/otserv/tfs\nsudo systemctl restart otserv.service',
          desc: 'O executável agora está pronto na pasta ~/otserv para rodar 24/7 com o MariaDB.',
        },
      ],
      tips: [
        'A VM.Standard.E2.1.Micro (1GB RAM) roda perfeitamente o Yurots 7.72 para 10 a 30 jogadores simultâneos com apenas ~300MB de RAM após compilado!',
        'A estrutura do servidor inclui o schema.sql que popula o MariaDB com todas as tabelas compatíveis.',
        'Se compilar na instância ARM Ampere da Oracle (A1.Flex), o TFS compila com suporte nativo a 64-bit e performance excepcional.',
      ],
    },
  },
  {
    id: 'step-7-config',
    title: '7. Configurar o config.lua e Importar o Mapa',
    shortDesc: 'Definir o IP público da Oracle, senhas do banco e nome do servidor.',
    difficulty: 'Fácil',
    estimatedMinutes: 5,
    content: {
      summary: 'Agora conectamos o executável ao banco MariaDB e colocamos o seu IP público da Oracle.',
      instructions: [
        'Abra o arquivo config.lua para edição:',
      ],
      commands: [
        {
          label: 'Importar o schema SQL inicial',
          cmd: 'mysql -u otserv -p\'yurots_senha_forte_2026\' yurots_80 < ~/otserv/schema.sql',
        },
        {
          label: 'Editar o arquivo config.lua',
          cmd: 'nano ~/otserv/config.lua',
          desc: 'Altere a linha: ip = "SEU_IP_PUBLICO_ORACLE" e configure sqlPass com a sua senha.',
        },
        {
          label: 'Testar o servidor pela primeira vez',
          cmd: './tfs',
          desc: 'O console exibirá ">> Yurots Server Online!". Pressione CTRL+C para parar por enquanto.',
        },
      ],
      tips: [
        'Use a aba "Painel do GOD" neste portal para gerar o config.lua pronto para colar!',
      ],
    },
  },
  {
    id: 'step-8-systemd',
    title: '8. Configurar Auto-Restart 24/7 com Systemd',
    shortDesc: 'Garantir que o servidor nunca caia e reinicie sozinho se a máquina reiniciar.',
    difficulty: 'Fácil',
    estimatedMinutes: 4,
    content: {
      summary: 'Com um serviço systemd, você pode fechar o terminal do computador e o OTServ continuará rodando 24 horas por dia, 7 dias por semana na Oracle Cloud. Se o servidor sofrer um crash, ele reinicia em 3 segundos automaticamente.',
      instructions: [
        'Crie o arquivo de serviço do sistema com o comando:',
      ],
      commands: [
        {
          label: 'Criar o arquivo de serviço do OTServ',
          cmd: `sudo bash -c 'cat > /etc/systemd/system/otserv.service << "EOF"
[Unit]
Description=Yurots 8.0 OTServ Service
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/otserv
ExecStart=/home/ubuntu/otserv/tfs
Restart=always
RestartSec=3
StandardOutput=append:/home/ubuntu/otserv/server.log
StandardError=append:/home/ubuntu/otserv/server_error.log

[Install]
WantedBy=multi-user.target
EOF'`,
        },
        {
          label: 'Ativar e Iniciar o Serviço',
          cmd: 'sudo systemctl daemon-reload\nsudo systemctl enable otserv\nsudo systemctl start otserv',
          desc: 'Pronto! Seu servidor está oficialmente rodando em segundo plano 24/7!',
        },
        {
          label: 'Comandos úteis para gerenciar o servidor',
          cmd: '# Ver status:\nsudo systemctl status otserv\n\n# Ver logs em tempo real:\ntail -f ~/otserv/server.log\n\n# Reiniciar servidor:\nsudo systemctl restart otserv',
        },
      ],
      tips: [
        'Agora seu servidor Yurots 8.0 está 100% online na nuvem!',
      ],
    },
  },
];

export const CLIENT_PACKAGING_GUIDE = {
  title: 'Como Montar o Pacote do Cliente 8.0 com vBot para os Jogadores',
  overview: 'Para que seus jogadores entrem no seu servidor sem complicações e com a melhor experiência de jogo, entregue um pacote completo em arquivo .ZIP (ex: MARLEYOT_Client_vBot.zip) com o IP da Oracle Cloud travado e o vBot (V-Bot) 100% integrado e pré-configurado para Tibia 8.0!',
  recommendedOptions: [
    {
      id: 'otclient_vbot',
      name: 'Opção 1: OTClientv8 com vBot Integrado (Recomendação Principal)',
      badge: 'vBot Embutido • 60+ FPS • Sem IP Changer',
      pros: [
        'vBot (V-Bot) nativo em modules/game_bot/ com Cavebot, Healer, Targetbot e Tools',
        'Auto UH, Auto Mana Fluid, Auto Exura Gran e Auto Haste já configurados para Tibia 8.0',
        'IP 137.131.196.66 gravado direto no entergame.lua: o jogador só abre e joga',
        'Gráficos acelerados por DirectX/OpenGL lisos sem congelamentos no Windows 10 e 11',
      ],
    },
    {
      id: 'otclient_clean',
      name: 'Opção 2: OTClientv8 Limpo (Sem Bot)',
      badge: 'Puro PvP Hand-Play',
      pros: [
        'Sem o módulo game_bot carregado: foco total em PvP manual e nostalgia',
        'Mesma estabilidade de FPS e IP travado da Opção 1',
      ],
    },
    {
      id: 'classic',
      name: 'Opção 3: Cliente Clássico Tibia 8.0 (Tibia.exe Original de 2007)',
      badge: '100% Retrô Anos 2000',
      pros: [
        'A interface nostálgica cinza original de 2007 com botões clássicos',
        'Pode usar MageBot, ElfBot NG ou Tibia Auto instalados externamente',
      ],
    },
  ],
  otclientSteps: [
    {
      title: 'Passo 1: Baixar a base do OTClientv8 com módulo vBot',
      desc: 'Baixe a versão com o módulo game_bot (vBot) ativo do repositório oficial da comunidade.',
      url: 'https://github.com/OTCv8/otclientv8 ou https://github.com/Vithrax/vbot',
    },
    {
      title: 'Passo 2: Inserir as Sprites do Tibia 7.72 (Tibia.spr e Tibia.dat)',
      desc: 'Copie os arquivos "Tibia.spr" e "Tibia.dat" da versão 7.72 para a pasta data/things/772/ do seu OTClient.',
      url: 'data/things/772/Tibia.spr e Tibia.dat',
    },
    {
      title: 'Passo 3: Travar o IP da sua Oracle (137.131.196.66) no entergame.lua',
      desc: 'Abra o arquivo modules/client_entergame/entergame.lua e cole o código fornecido abaixo para que a tela de login já conecte direto no seu MARLEYOT.',
    },
    {
      title: 'Passo 4: Adicionar o Perfil do vBot para MARLEYOT Yurots 7.72',
      desc: 'Copie o arquivo de configuração pré-pronto do vBot (com Auto UH, Auto Mana Fluid, Auto Haste e Anti-Idle) para a pasta modules/game_bot/default_configs/vbot/configs/.',
    },
    {
      title: 'Passo 5: Compactar em .ZIP e enviar para os amigos',
      desc: 'Compacte a pasta em "MARLEYOT_Client_vBot.zip" e envie via Google Drive ou MediaFire para seus amigos jogarem!',
    },
  ],
};
