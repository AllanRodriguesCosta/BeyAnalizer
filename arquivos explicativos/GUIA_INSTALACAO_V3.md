# Guia de Instalação V3 - Beyblade X Combo Analyzer com Base de Dados Auto-Incrementável

## 📋 Resumo das Melhorias (Versão 3.0)

Esta versão adiciona um sistema inteligente de base de dados auto-incrementável que aprende com seus resultados de batalhas e torneios, fornecendo recomendações cada vez mais precisas.

### ✅ Novas Funcionalidades

**1. Base de Dados Auto-Incrementável**
- Armazena histórico completo de batalhas
- Registra resultados de torneios (3 Beyblades por competidor)
- Calcula estatísticas em tempo real
- Atualiza dinâmica de metagame automaticamente
- Evolui conforme mais dados são adicionados

**2. Registrador de Batalhas**
- Adicione resultados individuais de batalhas
- Registre oponente e estratégia
- Adicione notas personalizadas
- Rastreie tendências de combos

**3. Registrador de Torneios**
- Registre 3 Beyblades de torneio
- Adicione resultados (vitórias, derrotas, empates) por Beyblade
- Armazene informações do torneio (nome, data, local)
- Processe resultados automaticamente

**4. Comparador de Combos Avançado**
- Compare dois combos lado-a-lado
- Visualize diferenças de atributos
- Veja histórico de performance
- Recomendações baseadas em dados

**5. Recomendador Automático Inteligente**
- Gera recomendações baseado em histórico
- Filtra por tipo de oponente (Attack, Defense, Stamina)
- Fornece alternativas viáveis
- Mostra confiança da recomendação
- Evolui com mais dados

**6. Estatísticas de Batalhas**
- Dashboard com métricas completas
- Gráficos de win rate por combo
- Distribuição de resultados (vitórias/derrotas/empates)
- Top 5 combos por performance
- Dinâmica de metagame em tempo real

---

## 🚀 Como Instalar

### Passo 1: Copiar Novos Arquivos

```bash
# Copiar tipos
cp types/battleDatabase.ts client/src/types/

# Copiar hooks
cp hooks/useBattleDatabase.ts client/src/hooks/

# Copiar componentes
cp components/ComboComparator.tsx client/src/components/
cp components/AutomaticRecommender.tsx client/src/components/
cp components/BattleStatistics.tsx client/src/components/
```

### Passo 2: Instalar Dependências (se necessário)

O projeto já inclui Recharts para gráficos. Se não tiver, instale:

```bash
pnpm add recharts
```

### Passo 3: Atualizar Imports

```typescript
import { useBattleDatabase } from "@/hooks/useBattleDatabase";
import ComboComparator from "@/components/ComboComparator";
import AutomaticRecommender from "@/components/AutomaticRecommender";
import BattleStatistics from "@/components/BattleStatistics";
import { BattleRecord, TournamentEntry } from "@/types/battleDatabase";
```

### Passo 4: Integrar no Componente Principal

```typescript
const { 
  database, 
  isLoaded,
  addBattleRecord,
  addTournamentEntry,
  generateAutomaticRecommendation,
  getComboStatistics,
  exportDatabase,
  importDatabase 
} = useBattleDatabase();

// Adicionar batalha
const handleAddBattle = (record: BattleRecord) => {
  addBattleRecord(record);
};

// Adicionar torneio
const handleAddTournament = (tournament: TournamentEntry) => {
  addTournamentEntry(tournament);
};

// Gerar recomendação
const recommendation = generateAutomaticRecommendation("Attack");
```

---

## 📊 Estrutura de Dados

### BattleRecord
```typescript
{
  id: string;
  date: string;
  comboId: string;
  bladeName: string;
  ratchetName: string;
  bitName: string;
  beyType: "BX" | "UX" | "CX";
  result: "win" | "loss" | "draw";
  opponent?: { bladeName?: string; comboDescription?: string };
  notes?: string;
  timestamp: number;
}
```

### TournamentEntry
```typescript
{
  id: string;
  tournamentName: string;
  date: string;
  location?: string;
  beys: Array<{ bladeName, ratchetName, bitName, beyType }>;
  results: Array<{ beyCombo, wins, losses, draws }>;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  placement?: number;
  notes?: string;
  timestamp: number;
}
```

### ComboStatistics
```typescript
{
  comboId: string;
  bladeName: string;
  ratchetName: string;
  bitName: string;
  beyType: "BX" | "UX" | "CX";
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  lossRate: number;
  drawRate: number;
  lastUsed: string;
  firstUsed: string;
  favorability: "Excelente" | "Muito Bom" | "Bom" | "Aceitável" | "Fraco";
  trends: { recentWinRate, allTimeWinRate, trend };
}
```

---

## 🎯 Como Usar

### 1. Registrar Batalha Individual

```typescript
addBattleRecord({
  date: new Date().toISOString(),
  comboId: "Soar Phoenix-9-60-GF",
  bladeName: "Soar Phoenix",
  ratchetName: "9-60",
  bitName: "GF",
  beyType: "BX",
  result: "win",
  opponent: { bladeName: "Cobalt Dragoon" },
  notes: "Vitória por stamina"
});
```

### 2. Registrar Torneio

```typescript
addTournamentEntry({
  tournamentName: "Campeonato Regional 2025",
  date: "2025-12-07",
  location: "São Paulo, SP",
  beys: [
    { bladeName: "Soar Phoenix", ratchetName: "9-60", bitName: "GF", beyType: "BX" },
    { bladeName: "Cobalt Dragoon", ratchetName: "7-60", bitName: "B", beyType: "BX" },
    { bladeName: "Shark Scale", ratchetName: "3-60", bitName: "LR", beyType: "BX" }
  ],
  results: [
    { beyCombo: "Soar Phoenix-9-60-GF", wins: 3, losses: 1, draws: 0 },
    { beyCombo: "Cobalt Dragoon-7-60-B", wins: 2, losses: 2, draws: 0 },
    { beyCombo: "Shark Scale-3-60-LR", wins: 4, losses: 0, draws: 0 }
  ],
  totalWins: 9,
  totalLosses: 3,
  totalDraws: 0,
  placement: 2
});
```

### 3. Gerar Recomendação Automática

```typescript
// Sem filtro
const recommendation = generateAutomaticRecommendation();

// Contra tipo específico
const recAgainstAttack = generateAutomaticRecommendation("Attack");
const recAgainstDefense = generateAutomaticRecommendation("Defense");
const recAgainstStamina = generateAutomaticRecommendation("Stamina");
```

### 4. Obter Estatísticas de Combo

```typescript
const stats = getComboStatistics("Soar Phoenix", "9-60", "GF");
console.log(stats.winRate); // 75.5
console.log(stats.favorability); // "Excelente"
console.log(stats.totalBattles); // 20
```

### 5. Exportar/Importar Banco de Dados

```typescript
// Exportar
exportDatabase(); // Baixa arquivo JSON

// Importar
const fileInput = document.querySelector('input[type="file"]');
fileInput?.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) importDatabase(file);
});
```

---

## 📈 Como o Sistema Aprende

### Ciclo de Aprendizado

1. **Entrada de Dados**: Você registra uma batalha ou torneio
2. **Processamento**: Sistema calcula estatísticas do combo
3. **Armazenamento**: Dados salvos em localStorage
4. **Análise**: Metagame é atualizado automaticamente
5. **Recomendação**: Sistema gera recomendações mais precisas

### Evolução de Confiança

- **0-10 batalhas**: 0-20% confiança (dados iniciais)
- **10-30 batalhas**: 20-50% confiança (padrão emergindo)
- **30-50 batalhas**: 50-75% confiança (padrão estabelecido)
- **50+ batalhas**: 75-100% confiança (dados sólidos)

### Atualização de Metagame

O sistema atualiza a dinâmica de metagame automaticamente quando:
- Nova batalha é registrada
- Novo torneio é adicionado
- Combo atinge 10 batalhas
- Semana passa desde última atualização

---

## 🔄 Fluxo de Dados

```
Usuário Registra Batalha
    ↓
useBattleDatabase Hook
    ↓
Atualiza ComboStatistics
    ↓
Recalcula Dinâmica de Metagame
    ↓
Salva em localStorage
    ↓
Recomendador Automático Atualizado
    ↓
Interface Reflete Mudanças
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Acompanhar Performance de um Combo

```typescript
// Registrar 5 batalhas com Soar Phoenix
for (let i = 0; i < 5; i++) {
  addBattleRecord({
    date: new Date().toISOString(),
    comboId: "Soar Phoenix-9-60-GF",
    bladeName: "Soar Phoenix",
    ratchetName: "9-60",
    bitName: "GF",
    beyType: "BX",
    result: i % 2 === 0 ? "win" : "loss"
  });
}

// Verificar performance
const stats = getComboStatistics("Soar Phoenix", "9-60", "GF");
console.log(`Win Rate: ${stats.winRate}%`);
console.log(`Favorability: ${stats.favorability}`);
```

### Exemplo 2: Encontrar Melhor Combo contra Ataque

```typescript
const rec = generateAutomaticRecommendation("Attack");
console.log(rec.recommendedCombo); // Combo mais eficaz contra ataque
console.log(rec.expectedWinRate); // Taxa esperada
console.log(rec.confidence); // Confiança da recomendação
```

### Exemplo 3: Comparar Performance entre Torneios

```typescript
// Registrar torneio 1
addTournamentEntry(tournament1);

// Registrar torneio 2
addTournamentEntry(tournament2);

// Visualizar estatísticas
const allStats = database.comboStatistics;
const bestPerformers = allStats.sort((a, b) => b.winRate - a.winRate);
```

---

## 🔐 Persistência de Dados

- **Armazenamento**: localStorage (navegador)
- **Formato**: JSON
- **Limite**: ~5-10MB por domínio
- **Backup**: Exporte regularmente
- **Sincronização**: Manual (importar/exportar)

---

## ⚙️ Configurações Recomendadas

### Para Jogadores Casuais
- Registre batalhas quando quiser
- Exporte dados mensalmente
- Use recomendações como sugestão

### Para Jogadores Competitivos
- Registre todas as batalhas
- Registre todos os torneios
- Exporte dados após cada competição
- Analise tendências regularmente

### Para Pesquisadores de Metagame
- Registre dados detalhados
- Mantenha histórico completo
- Analise dinâmica de metagame
- Compartilhe insights (quando servidor estiver disponível)

---

## 📊 Métricas Importantes

| Métrica | Significado | Ação |
|---------|-----------|------|
| Win Rate | Percentual de vitórias | > 60% = Excelente |
| Total Battles | Quantidade de dados | > 30 = Confiável |
| Favorability | Qualidade geral | Excelente/Muito Bom = Usar |
| Trend | Direção da performance | Crescente = Melhorando |
| Confidence | Confiança da recomendação | > 80% = Muito Confiável |

---

## 🐛 Troubleshooting

### Recomendações não aparecem
- Registre mais batalhas (mínimo 5)
- Verifique se os dados foram salvos
- Limpe cache e recarregue

### Dados não persistem
- Verifique localStorage no navegador
- Certifique-se de que não está em modo privado
- Exporte e reimporte dados

### Metagame não atualiza
- Registre nova batalha ou torneio
- Aguarde processamento automático
- Verifique console para erros

---

## 🚀 Próximas Melhorias (V4.0)

1. **Integração com Servidor**: Sincronizar dados entre dispositivos
2. **Comunidade**: Compartilhar combos e resultados
3. **IA Avançada**: Previsão de matchups
4. **Análise Profunda**: Padrões de metagame
5. **Mobile App**: Versão mobile nativa

---

**Versão**: 3.0  
**Data**: Dezembro 2025  
**Status**: Pronto para uso competitivo com aprendizado automático  
**Última Atualização**: Sistema de Base de Dados Auto-Incrementável
