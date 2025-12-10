# Beyblade X Combo Analyzer - Versão 3.0

Sistema inteligente de análise de combinações com base de dados auto-incrementável que aprende com seus resultados de batalhas e torneios.

## 🎯 O Que é Novo na V3.0

### Base de Dados Auto-Incrementável
- Aprende com cada batalha que você registra
- Evolui conforme mais dados são adicionados
- Gera recomendações cada vez mais precisas
- Rastreia dinâmica de metagame em tempo real

### Registrador de Batalhas
- Adicione resultados individuais de batalhas
- Registre oponente e estratégia
- Rastreie tendências de combos
- Histórico completo persistido

### Registrador de Torneios
- Registre 3 Beyblades de torneio
- Adicione resultados por Beyblade
- Armazene informações do torneio
- Processa resultados automaticamente

### Recomendador Automático Inteligente
- Gera recomendações baseado em histórico
- Filtra por tipo de oponente
- Fornece alternativas viáveis
- Mostra confiança da recomendação
- Evolui com mais dados

### Estatísticas de Batalhas
- Dashboard com métricas completas
- Gráficos de win rate por combo
- Distribuição de resultados
- Top 5 combos por performance
- Dinâmica de metagame em tempo real

### Análise Dinâmica de Metagame
- Identifica arquétipos dominantes
- Detecta tendências emergentes
- Analisa matchups
- Sugere ajustes de combo
- Fornece insights estratégicos

## 📦 Arquivos Inclusos

```
beyblade_updates/
├── types/
│   └── battleDatabase.ts              # Tipos para base de dados
├── hooks/
│   ├── usePartsStorageV2.ts           # Gerenciamento de peças
│   └── useBattleDatabase.ts           # Base de dados de batalhas
├── components/
│   ├── AddPartModalV2.tsx             # Modal para adicionar peças
│   ├── RadarChart.tsx                 # Gráfico de Radar
│   ├── ComboComparator.tsx            # Registrador de torneios
│   ├── AutomaticRecommender.tsx       # Recomendador automático
│   └── BattleStatistics.tsx           # Dashboard de estatísticas
├── lib/
│   ├── comboAnalysis.ts               # Análise de combos
│   ├── metagameAnalysis.ts            # Análise de metagame estático
│   └── dynamicMetagameAnalysis.ts     # Análise dinâmica de metagame
├── public/
│   ├── beyblade_parts_db.json         # Base de dados de peças
│   └── metagame_rankings.json         # Rankings estáticos
├── GUIA_INSTALACAO.md                 # Guia básico (V1)
├── GUIA_INSTALACAO_V2.md              # Guia V2 (com metagame)
├── GUIA_INSTALACAO_V3.md              # Guia V3 (com BD auto-incrementável)
├── beyblade_metagame_rankings.md      # Análise detalhada de metagame
└── README_V3.md                       # Este arquivo
```

## 🚀 Instalação Rápida

### 1. Copiar Arquivos

```bash
# Tipos
cp types/battleDatabase.ts client/src/types/

# Hooks
cp hooks/useBattleDatabase.ts client/src/hooks/

# Componentes
cp components/ComboComparator.tsx client/src/components/
cp components/AutomaticRecommender.tsx client/src/components/
cp components/BattleStatistics.tsx client/src/components/

# Lib
cp lib/dynamicMetagameAnalysis.ts client/src/lib/
```

### 2. Instalar Dependências

```bash
pnpm add recharts  # Se não tiver
```

### 3. Importar e Usar

```typescript
import { useBattleDatabase } from "@/hooks/useBattleDatabase";
import ComboComparator from "@/components/ComboComparator";
import AutomaticRecommender from "@/components/AutomaticRecommender";
import BattleStatistics from "@/components/BattleStatistics";

const {
  database,
  addBattleRecord,
  addTournamentEntry,
  generateAutomaticRecommendation,
  getComboStatistics,
  exportDatabase,
  importDatabase
} = useBattleDatabase();
```

## 🎮 Como Usar

### Registrar Batalha

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

### Registrar Torneio

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

### Gerar Recomendação

```typescript
// Sem filtro
const rec = generateAutomaticRecommendation();

// Contra tipo específico
const recAttack = generateAutomaticRecommendation("Attack");
const recDefense = generateAutomaticRecommendation("Defense");
const recStamina = generateAutomaticRecommendation("Stamina");
```

### Obter Estatísticas

```typescript
const stats = getComboStatistics("Soar Phoenix", "9-60", "GF");
console.log(stats.winRate);      // 75.5
console.log(stats.favorability); // "Excelente"
console.log(stats.totalBattles); // 20
```

### Exportar/Importar Dados

```typescript
// Exportar
exportDatabase();

// Importar
const file = document.querySelector('input[type="file"]');
file?.addEventListener('change', (e) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) importDatabase(f);
});
```

## 📊 Componentes Principais

### useBattleDatabase Hook
- Gerencia toda a base de dados de batalhas
- Calcula estatísticas automaticamente
- Atualiza metagame em tempo real
- Exporta/importa dados em JSON

### ComboComparator
- Interface para registrar torneios
- Suporta até 5 Beyblades
- Registra vitórias/derrotas/empates
- Processa automaticamente

### AutomaticRecommender
- Gera recomendações baseado em histórico
- Mostra confiança da recomendação
- Fornece alternativas viáveis
- Filtra por tipo de oponente

### BattleStatistics
- Dashboard com 6 visualizações
- Gráficos de win rate
- Distribuição de resultados
- Top 5 combos
- Dinâmica de metagame

## 🧠 Como o Sistema Aprende

1. **Você registra uma batalha ou torneio**
   ↓
2. **Sistema calcula estatísticas do combo**
   ↓
3. **Dados salvos em localStorage**
   ↓
4. **Metagame atualizado automaticamente**
   ↓
5. **Recomendador gera sugestões mais precisas**
   ↓
6. **Próxima recomendação é melhor que a anterior**

## 📈 Evolução de Confiança

| Batalhas | Confiança | Status |
|----------|-----------|--------|
| 0-10 | 0-20% | Dados iniciais |
| 10-30 | 20-50% | Padrão emergindo |
| 30-50 | 50-75% | Padrão estabelecido |
| 50+ | 75-100% | Dados sólidos |

## 🔄 Ciclo de Aprendizado

```
Dia 1: Registra 5 batalhas
  → Recomendação com 20% confiança

Dia 7: Registra 25 batalhas
  → Recomendação com 50% confiança

Dia 30: Registra 100 batalhas
  → Recomendação com 90% confiança

Dia 60: Registra 200 batalhas
  → Recomendação com 100% confiança
```

## 💡 Dicas de Uso

### Para Máxima Efetividade
1. Registre TODAS as suas batalhas
2. Registre torneios completos
3. Adicione notas sobre estratégia
4. Exporte dados regularmente
5. Analise tendências semanalmente

### Para Análise de Metagame
1. Compare combos diferentes
2. Observe tendências de win rate
3. Identifique matchups favoráveis
4. Teste sugestões do recomendador
5. Registre resultados

### Para Competição
1. Use recomendador antes de torneios
2. Registre todos os resultados
3. Analise performance por combo
4. Identifique combos fracos
5. Adapte estratégia conforme aprende

## 🔐 Segurança de Dados

- **Armazenamento**: localStorage (navegador)
- **Formato**: JSON
- **Backup**: Exporte regularmente
- **Limite**: ~5-10MB por domínio
- **Sincronização**: Manual (importar/exportar)

## 📊 Métricas Rastreadas

- Total de batalhas
- Vitórias/Derrotas/Empates
- Win rate por combo
- Favorabilidade
- Tendências (Crescente/Estável/Decrescente)
- Arquétipos dominantes
- Matchups

## 🚀 Próximas Melhorias (V4.0)

- [ ] Integração com servidor
- [ ] Sincronização entre dispositivos
- [ ] Compartilhamento de combos
- [ ] IA avançada para previsão
- [ ] Análise profunda de padrões
- [ ] App mobile nativo

## 📞 Suporte

Para problemas:
1. Verifique localStorage no navegador
2. Exporte e reimporte dados
3. Limpe cache e recarregue
4. Consulte GUIA_INSTALACAO_V3.md

## 📄 Versões

- **V1.0**: Análise básica de combos
- **V2.0**: Metagame estático + rankings
- **V3.0**: Base de dados auto-incrementável + aprendizado

---

**Versão**: 3.0  
**Data**: Dezembro 2025  
**Status**: Pronto para uso competitivo  
**Última Atualização**: Sistema de Base de Dados Auto-Incrementável
