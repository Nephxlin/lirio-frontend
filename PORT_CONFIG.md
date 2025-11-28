# Configuração de Porta - Casino Frontend

## 🔧 Como o Next.js Define a Porta

O Next.js usa a seguinte ordem de prioridade para definir a porta:

1. **Variável de ambiente `PORT`** (mais alta prioridade)
2. **Flag `-p` no comando** (package.json)
3. **Porta padrão: 3000** (se nada for especificado)

## 📦 Configuração Atual

### Local (Desenvolvimento)
```bash
yarn dev
# Roda na porta 3006 (definido no package.json)
```

### Produção (Coolify)
```bash
yarn start
# Roda na porta definida pela variável PORT do Coolify
# OU porta 3000 (padrão do Next.js) se PORT não estiver definida
```

## ⚙️ Configuração no Coolify

### Opção 1: Usar Porta Padrão (3000) - RECOMENDADO
Não configure variável `PORT`. O Next.js usará automaticamente a porta 3000.

**Configuração no Coolify:**
- Porta Interna: `3000`
- Porta Externa: (definida pelo Coolify)

### Opção 2: Usar Porta Customizada
Configure a variável de ambiente:

```bash
PORT=3006
```

**Configuração no Coolify:**
- Adicione variável `PORT=3006`
- Marque como "Available at Runtime"
- Porta Interna: `3006`
- Porta Externa: (definida pelo Coolify)

## 🚨 Problema: Bad Gateway

Se você ver "Bad Gateway" após deploy:

### Causa
O Coolify está tentando se conectar à porta errada.

### Solução
1. Verifique qual porta o Next.js está usando nos logs:
   ```
   - ready started server on 0.0.0.0:3000
   ```

2. No Coolify, vá em "Settings" do serviço
3. Verifique se a "Porta Interna" corresponde à porta nos logs
4. Se não corresponder, ajuste para `3000`
5. Redeploy

## 🔍 Debug

### Ver qual porta está sendo usada
Nos logs do Coolify, procure por:
```
- ready started server on 0.0.0.0:XXXX
```

### Testar localmente
```bash
# Teste com porta padrão
yarn build
yarn start
# Deve mostrar: ready started server on 0.0.0.0:3000

# Teste com PORT customizada
PORT=8080 yarn start
# Deve mostrar: ready started server on 0.0.0.0:8080
```

## 📋 Checklist de Deploy

Antes de fazer deploy:

- [ ] `yarn build` funciona sem erros localmente
- [ ] Decidiu qual porta usar (3000 recomendado)
- [ ] Configurou a mesma porta no Coolify (Settings > Port Mapping)
- [ ] Se usar porta customizada, adicionou variável `PORT`
- [ ] Redeploy após mudanças

## 🎯 Configuração Recomendada para Produção

```bash
# Não configure PORT - deixe usar padrão 3000
# No Coolify:
# - Porta Interna: 3000
# - Porta Externa: (automático)
```

## 📝 Notas

- O script `dev` ainda usa `-p 3006` para desenvolvimento local
- O script `start` (produção) **não** tem `-p`, usa PORT ou 3000
- Isso permite desenvolvimento local na 3006 sem conflitar com outros serviços
- Em produção, Coolify gerencia o port mapping automaticamente

