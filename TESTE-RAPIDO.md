# ⚡ Teste Rápido - 2 Minutos

## 🎯 Verificação Rápida

### ✅ 1. Recarregue a Página (10 segundos)

```
1. Vá para: http://localhost:3006
2. Pressione: Ctrl + R (ou F5)
3. Aguarde carregar
```

### ✅ 2. Verifique o Console (10 segundos)

```
1. Pressione: F12
2. Clique em: Console
3. Verificar: ❌ Não deve ter erros vermelhos
```

**O que você DEVE ver:**
```
✅ Console limpo (ou apenas warnings amarelos)
✅ Sem "hostname" errors
✅ Sem "Invalid src prop" errors
```

**O que você NÃO deve ver:**
```
❌ Error: Invalid src prop...
❌ hostname "localhost" is not configured...
```

### ✅ 3. Verifique as Imagens (30 segundos)

**3.1 Cards de Jogos**
- ✅ Imagens dos jogos devem aparecer
- ✅ Hover deve funcionar (zoom, brilho)
- ✅ Sem quadrados cinzas vazios

**3.2 Categorias**
- ✅ Ícones das categorias devem aparecer
- ✅ Carrossel deve funcionar

**3.3 Perfil (se logado)**
- ✅ Avatar deve aparecer
- ✅ Jogos favoritos devem ter imagens

### ✅ 4. Teste o Network (30 segundos)

```
1. F12 > Network
2. Filtrar: Img
3. Recarregar página
4. Ver imagens carregando
```

**Deve mostrar:**
- ✅ Status: 200 (OK)
- ✅ Type: png/jpg/webp
- ✅ Size: variado
- ✅ Time: < 1s cada

---

## 🚨 Se Algo Não Funcionar

### Erro 1: Ainda vejo "hostname not configured"

**Solução:**
```bash
# Limpar cache
rm -rf .next

# Reiniciar
npm run dev
```

### Erro 2: Imagens não aparecem

**Verificar:**
1. Backend está rodando? (localhost:3005)
2. Placeholder existe? (public/placeholder-game.png)
3. Console mostra erro de rede? (404, 500)

**Testar:**
```
http://localhost:3005/uploads/[nome-arquivo]
# Deve abrir a imagem
```

### Erro 3: Console cheio de erros

**Copiar e verificar:**
1. Copie o erro completo
2. Verifique em TROUBLESHOOTING.md
3. Procure a solução específica

---

## ✨ Teste de Performance (Opcional)

### Lighthouse Test (2 minutos)

```
1. F12 > Lighthouse
2. Device: Mobile
3. Categories: Performance
4. Clicar: Analyze page load
5. Aguardar resultado
```

**Esperado:**
- Performance: **75-85** (antes: 45-55)
- LCP: **~2.5s** (antes: ~4.5s)
- No errors em Images

---

## 📋 Checklist Final

Marque conforme testa:

- [ ] Servidor rodando (localhost:3006)
- [ ] Página carregou sem erros
- [ ] Console limpo (sem erros vermelhos)
- [ ] Imagens dos jogos aparecem
- [ ] Hover nos jogos funciona
- [ ] Categorias com ícones
- [ ] Avatar no perfil (se logado)
- [ ] Network mostra imagens carregando
- [ ] Lighthouse > 70 (opcional)

---

## 🎉 Sucesso!

Se todos os checks acima passaram:

```
✅ Sistema funcionando 100%
✅ Otimizações ativas
✅ Pronto para continuar desenvolvimento
```

---

## 📞 Precisa de Ajuda?

### Documentação Completa:
1. **`LEIA-ME-PRIMEIRO.md`** - Visão geral
2. **`SOLUCAO-IMAGENS.md`** - Detalhes técnicos
3. **`TROUBLESHOOTING.md`** - Problemas e soluções
4. **`OTIMIZACOES.md`** - Todas as melhorias

### Debug Rápido:
```bash
# Verificar arquivos criados
ls components/common/OptimizedImage.tsx

# Verificar imports
grep -r "OptimizedImage" components/

# Verificar erros
npm run lint
```

---

**Tempo total: 2 minutos**
**Dificuldade: Fácil**
**Status: Pronto para testar**

